import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { ImageService } from '../../services/image.service';
import { ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

import { Router } from '@angular/router';
import { Merit } from '../../models/merits.model';
import {
  options,
  statusOptions,
  receiversDefault,
  Option,
} from '../../util/options';
import { formatDateWithoutTimezone } from '../../util/meritForm';

@Component({
  selector: 'app-merit-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatListModule,
  ],
  templateUrl: './merit-form.component.html',
  styleUrl: './merit-form.component.scss',
})
export class MeritFormComponent {
  loading = false;
  merit: Partial<Merit> = {
    title: '',
    description: '',
    type: '',
    status: '',
    image_urls: [],
    date: '',
    activity_start_date: '',
    activity_end_date: '',
  };

  types: Option[] = options;
  statusOptions: Option[] = statusOptions;
  receiversDefault: Option[] = receiversDefault;
  receiverDefault: string = '';
  previewUrl: string | null = null;
  filePreviews: string[] = [];
  imageUrl: string | null = null;
  imageUrls: string[] = [];
  selectedFiles: File[] = [];
  existingImages: string[] = [];
  removedImages: string[] = [];
  newVideoUrl: string = '';
  videoUrlsArray: string[] = [];
  defaultStatus: string = 'DONE';
  isDragging = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supabase: SupabaseService,
    private imageService: ImageService
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loading = true;
      try {
        this.merit = await this.supabase.getMeritById(+id);
        if (Array.isArray(this.merit.video_urls)) {
          this.videoUrlsArray = this.merit.video_urls;
        } else if (typeof this.merit.video_urls === 'string') {
          this.videoUrlsArray = this.getVideoUrls(this.merit.video_urls);
        } else {
          this.videoUrlsArray = [];
        }
        this.existingImages = [...(this.merit.image_urls || [])];
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    } else {
      this.merit = {
        title: '',
        description: '',
        type: '',
        status: this.defaultStatus,
        receiver: '',
        image_urls: [],
        date: '',
        activity_start_date: '',
        activity_end_date: '',
      };
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer?.files) {
      Array.from(event.dataTransfer.files).forEach((file) => {
        if (file.type.startsWith('image/')) {
          this.selectedFiles.push(file);

          const reader = new FileReader();
          reader.onload = () => {
            this.filePreviews.push(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  async onSubmit() {
    if (!this.merit.title || !this.merit.date || !this.merit.type) {
      alert('Please fill all required fields.');
      return;
    }

    this.loading = true;

    this.merit.date = formatDateWithoutTimezone(this.merit.date);
    this.merit.activity_start_date = this.merit.activity_start_date
      ? formatDateWithoutTimezone(this.merit.activity_start_date)
      : '';
    this.merit.activity_end_date = this.merit.activity_end_date
      ? formatDateWithoutTimezone(this.merit.activity_end_date)
      : '';

    this.merit.receiver = this.receiverDefault
      ? this.receiverDefault
      : this.merit.receiver;

    try {
      const uploadedUrls = await this.uploadSelectedImages();
      const finalImageUrls = [...this.existingImages, ...uploadedUrls].filter(
        Boolean
      );
      if (Array.isArray(this.merit.video_urls)) {
        this.videoUrlsArray = this.merit.video_urls;
      }
      const meritData = {
        title: this.merit.title!,
        description: this.merit.description ?? '',
        type: this.merit.type!,
        receiver: this.merit.receiver || '',
        date: this.merit.date!,
        activity_start_date: this.merit.activity_start_date || '',
        activity_end_date: this.merit.activity_end_date || '',
        status: this.merit.status || this.defaultStatus,
        image_urls: finalImageUrls || [],
        video_urls: this.videoUrlsArray || [],
      };

      if (this.merit.id) {
        await this.supabase.updateMerit(parseInt(this.merit.id), {
          id: this.merit.id,
          ...meritData,
        });

        for (const url of this.removedImages) {
          await this.deleteImageFromStorage(url);
        }
        this.removedImages = [];
      } else {
        await this.supabase.insertMerit(meritData);
      }
      this.goBackToDetailPage();
    } catch (err) {
      alert('An error occurred during submission.');
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  async uploadSelectedImages(): Promise<string[]> {
    const uploadedUrls: string[] = [];

    if (this.selectedFiles.length === 0) {
      return uploadedUrls;
    }

    for (const file of this.selectedFiles) {
      const maxSizeKB = (file.size * (2 / 3)) / 1000;
      const compressedFile = await this.imageService.compressImage(
        file,
        maxSizeKB
      );
      const url = await this.supabase.uploadImage(compressedFile);
      if (url) {
        uploadedUrls.push(url);
      }
    }

    return uploadedUrls;
  }

  onCancel() {
    this.goBackToDetailPage();
  }

  goBackToDetailPage() {
    this.router.navigate([`/merits/${this.merit.id ? this.merit.id : ''}`]);
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    Array.from(input.files).forEach((file) => {
      this.selectedFiles.push(file);

      const reader = new FileReader();
      reader.onload = () => {
        this.filePreviews.push(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
    input.value = '';
  }

  async deleteImageFromStorage(fullUrl: string): Promise<void> {
    try {
      await this.supabase.deleteImageFromStorage(fullUrl);
    } catch (err) {
      console.error('Error deleting image from storage:', err);
    }
  }

  removeExistingImageLocally(index: number) {
    const confirmDelete = confirm(
      'Remove this image? It will be deleted from storage after saving.'
    );
    if (!confirmDelete) return;

    const removed = this.existingImages.splice(index, 1)[0];
    this.removedImages.push(removed);
  }

  removeNewImageLocally(index: number) {
    this.selectedFiles.splice(index, 1);
    this.filePreviews.splice(index, 1);
  }

  getVideoUrls(input: any) {
    if (Array.isArray(input)) {
      return input;
    }
    if (typeof input === 'string') {
      const trimmed = input.trim();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          const jsonCompatible = trimmed.replace(/'/g, '"');
          const parsed = JSON.parse(jsonCompatible);
          if (Array.isArray(parsed)) {
            return parsed.map(String);
          }
        } catch {}
      }
      return trimmed
        .split(',')
        .map((s) => s.trim().replace(/^['"]+|['"]+$/g, ''))
        .filter((s) => s.length > 0);
    }
    return [];
  }

  addVideoUrl() {
    const url = this.newVideoUrl.trim();
    if (url && !this.videoUrlsArray.includes(url)) {
      this.videoUrlsArray.push(url);
      this.newVideoUrl = '';
    }
  }

  removeVideoUrl(index: number, event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.videoUrlsArray.splice(index, 1);
  }
}
