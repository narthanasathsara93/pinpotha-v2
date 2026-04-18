import { Injectable } from '@angular/core';
import { Merit } from '../models/merits.model';
import { supabase, bucketName, mertisTable } from '../util/supabase-client';
import imageCompression from 'browser-image-compression';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  async getMeritsPaged(
    pageIndex: number,
    pageSize: number,
    column: string,
    status: string,
    type?: string,
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
    merit: Omit<Merit, 'id' | 'created_at' | 'updated_at'>,
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
    merit: Omit<Merit, 'created_at' | 'updated_at'>,
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
    const hashString = (str: string): string => {
      let hash = 5381;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
      }
      return (hash >>> 0).toString(36).slice(0, 8);
    };

    const extension = file.name.split('.').pop();
    const filePath = `${Date.now()}${hashString(file.name)}.${extension}`;

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

  async downloadBlob(url: string): Promise<Blob> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download image from ${url}`);
    }
    return await response.blob();
  }

  private async fetchImageFile(url: string): Promise<File> {
    const blob = await this.downloadBlob(url);
    const rawName = url.split('/').pop() || 'image';
    const sanitizedName = rawName.split('?')[0];
    return new File([blob], sanitizedName, {
      type: blob.type || 'image/jpeg',
      lastModified: Date.now(),
    });
  }

  async compressAndUploadImage(file: File): Promise<string | null> {
    const compressedFile = await imageCompression(file, {
      maxSizeMB: 0.2,
      useWebWorker: true,
      maxIteration: 20,
      initialQuality: 0.9,
    });
    return await this.uploadImage(compressedFile);
  }

  async reuploadMeritImages(meritId: number): Promise<void> {
    const merit = await this.getMeritById(meritId);
    if (!merit || !Array.isArray(merit.image_urls) || merit.image_urls.length === 0) {
      return;
    }

    const newUrls: string[] = [];
    for (const url of merit.image_urls) {
      try {
        const file = await this.fetchImageFile(url);
        const uploadedUrl = await this.compressAndUploadImage(file);
        newUrls.push(uploadedUrl || url);
      } catch (err) {
        console.error('Failed to reupload image:', url, err);
        newUrls.push(url);
      }
    }

    await this.updateMerit(meritId, {
      ...merit,
      image_urls: newUrls,
    });
  }

  async reuploadAllMeritImages(): Promise<void> {
    const { data, error } = await supabase
      .from(mertisTable)
      .select('id');

    if (error) throw error;

    for (const item of data || []) {
      if (item?.id) {
        await this.reuploadMeritImages(item.id);
      }
    }
  }

  async listStorageFiles(prefix = ''): Promise<string[]> {
    const files: string[] = [];
    const limit = 1000;
    let offset = 0;

    while (true) {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list(prefix, { limit, offset, sortBy: { column: 'name', order: 'asc' } });

      if (error) throw error;
      if (!data || data.length === 0) break;

      files.push(...(data as any[]).map((file) => file.name));
      if (data.length < limit) break;
      offset += data.length;
    }

    return files;
  }

  private getStoragePathFromUrl(publicUrl: string): string | null {
    const filePath = publicUrl.split(`${bucketName}/`)[1];
    if (!filePath) return null;
    return filePath.split('?')[0];
  }

  async cleanupOrphanedImages(): Promise<{ deleted: string[]; orphaned: string[] }> {
    const { data, error } = await supabase
      .from(mertisTable)
      .select('image_urls');

    if (error) throw error;

    const usedPaths = new Set<string>();
    for (const row of data || []) {
      const urls = Array.isArray(row.image_urls)
        ? row.image_urls
        : typeof row.image_urls === 'string'
        ? row.image_urls
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      for (const url of urls) {
        const storagePath = this.getStoragePathFromUrl(url);
        if (storagePath) usedPaths.add(storagePath);
      }
    }

    const allFiles = await this.listStorageFiles();
    const orphaned = allFiles.filter((name) => !usedPaths.has(name));
    const deleted: string[] = [];

    for (const fileName of orphaned) {

      const { error: removeError } = await supabase.storage
        .from(bucketName)
        .remove([fileName]);

      if (removeError) {
        console.error('Failed to delete orphaned image:', fileName, removeError);
      } else {
        console.log('Deleted:', fileName);
        deleted.push(fileName);
      }
    }

    return { deleted, orphaned };
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
