import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import imageCompression from 'browser-image-compression';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  constructor() {}

  async compressImage(file: File): Promise<File> {
    const compressedFile = await imageCompression(file, {
      maxSizeMB: 0.2,
      useWebWorker: true,
      maxIteration: 20,
      initialQuality: 0.9,
    });
    return compressedFile;
  }

  getImageByName(imageName: string): string {
    return `${environment.SUPABASE_STORAGE_URL}${imageName}`;
  }
}
