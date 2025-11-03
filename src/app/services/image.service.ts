import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  constructor() {}

  compressImage(file: File, maxSizeKB: number = 200): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event: any) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject('Could not get canvas context');
            return;
          }

          ctx.drawImage(img, 0, 0, img.width, img.height);

          let quality = 0.9;

          const tryCompress = () => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject('Compression failed');
                  return;
                }

                // Check size
                if (blob.size / 1024 > maxSizeKB && quality > 0.1) {
                  quality -= 0.1;
                  tryCompress();
                } else {
                  const compressedFile = new File([blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  });
                  resolve(compressedFile);
                }
              },
              'image/jpeg',
              quality
            );
          };

          tryCompress();
        };

        img.onerror = (err) => reject(err);
      };

      reader.onerror = (err) => reject(err);
    });
  }

  getImageByName(imageName: string): string {
    return `${environment.SUPABASE_STORAGE_URL}${imageName}`;
  }
}
