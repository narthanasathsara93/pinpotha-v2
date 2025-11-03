import { Injectable } from '@angular/core';
import { supabase } from '../util/supabase-client';
import * as bcrypt from 'bcryptjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  async createUser(userName: string, password: string): Promise<string | null> {
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      const { error } = await supabase.from('auth_settings').insert([
        {
          user_name: userName,
          password_hash: passwordHash,
        },
      ]);

      if (error) {
        console.error('Error creating user:', error.message);
        return error.message;
      }

      return null;
    } catch (err: any) {
      console.error('Unexpected error:', err.message);
      return err.message;
    }
  }

  async userNameExits(userName: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('auth_settings')
      .select('*')
      .eq('user_name', userName)
      .single();

    if (error || !data) {
      console.error('Error fetching user name:', error?.message);
      return false;
    }

    if (data.user_name) {
      return true;
    }
    return false;
  }

  async getPasswordHash(userName: string): Promise<string> {
    const { data, error } = await supabase
      .from('auth_settings')
      .select('password_hash')
      .eq('user_name', userName)
      .single();

    if (error || !data) {
      throw new Error('Failed to fetch password hash');
    }

    return data.password_hash;
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('auth') === 'true';
  }
}
