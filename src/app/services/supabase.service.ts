import { Injectable } from '@angular/core';
import { Merit } from '../models/merits.model';
import { supabase, bucketName, mertisTable } from '../util/supabase-client';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  async getMeritsPaged(
    pageIndex: number,
    pageSize: number,
    column: string,
    status: string,
    type?: string
  ): Promise<{ data: Merit[]; count: number }> {
    const from = pageIndex * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('merits')
      .select('*', { count: 'exact' })
      .order('date', { ascending: false })
      .range(from, to);

    if (type && type !== '') {
      query = query.eq(column, type);
    }

    if (status && status !== '') {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;
   
    if (error) throw error;
    return { data: data || [], count: count || 0 };
  }

  async getMeritById(id: number): Promise<any> {
    const { data, error } = await supabase
      .from(mertisTable)
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      return null;
    }
    return data;
  }

  async insertMerit(
    merit: Omit<Merit, 'id' | 'created_at' | 'updated_at'>
  ): Promise<{ error?: string }> {
    const { error } = await supabase.from(mertisTable).insert([merit]);
    if (error) {
      return { error: error.message };
    }
    this.clearCache();
    return {};
  }

  async updateMerit(
    id: number,
    merit: Omit<Merit, 'created_at' | 'updated_at'>
  ): Promise<void> {
    try {
      const { error: fetchError } = await supabase
        .from(mertisTable)
        .select('image_urls')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const newUrls: string[] = [];
      for (const img of merit.image_urls || []) {
        if (
          typeof img === 'object' &&
          img !== null &&
          'name' in img &&
          'size' in img &&
          'type' in img
        ) {
          const uploadedUrl = await this.uploadImage(img as File);
          if (uploadedUrl) newUrls.push(uploadedUrl);
        } else {
          newUrls.push(img);
        }
      }

      const { error: updateError } = await supabase
        .from(mertisTable)
        .update({
          ...merit,
          image_urls: newUrls,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      this.clearCache();
    } catch (err) {
      console.error('Error updating merit:', err);
      throw err;
    }
  }

  async deleteMerit(id: number): Promise<any> {
    const { error } = await supabase.from(mertisTable).delete().eq('id', id);
    if (error) throw new Error('Failed to delete merit: ' + error.message);
    this.clearCache();
  }

  async uploadImage(file: File): Promise<string | null> {
    const filePath = `${Date.now()}_${file.name}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Image upload error:', error.message);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    this.clearCache();
    return publicUrlData.publicUrl;
  }

  async deleteImageFromStorage(publicUrl: string): Promise<void> {
    try {
      const fileName = publicUrl.split(`${bucketName}/`)[1];

      if (!fileName) {
        console.error('Invalid file path extracted from URL:', publicUrl);
        return;
      }

      const { error, data } = await supabase.storage
        .from(`${bucketName}`)
        .remove([`${fileName}`]);
      this.clearCache();

      if (error) {
        console.error('Error deleting image from storage:', error);
      }
    } catch (err) {
      console.error('Unexpected error deleting image from storage:', err);
    }
  }

  clearCache() {
    localStorage.removeItem('meritsCache');
  }
}
