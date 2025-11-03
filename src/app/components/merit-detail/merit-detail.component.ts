import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { NgIf } from '@angular/common';
import { CommonModule } from '@angular/common';
import { ImageGalleryComponent } from '../image-gallery/image-gallery.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';

import { statusOptions, sinhalaMonths, Option } from '../../util/options';
import { formatDateWithoutTimezone } from '../../util/meritForm';

import {
  DomSanitizer,
  SafeResourceUrl,
  SafeHtml,
} from '@angular/platform-browser';
@Component({
  selector: 'app-merit-detail',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    ImageGalleryComponent,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './merit-detail.component.html',
  styleUrl: './merit-detail.component.scss',
})
export class MeritDetailComponent {
  merit: any = {
    image_urls: [],
  };
  videoUrls: SafeResourceUrl[] = [];
  loading = true;
  error = '';
  selectedImageIndex = 0;
  safeDescription!: SafeHtml;
  statusOptions: Option[] = statusOptions;
  activityPeriodText: string = '';
  activityPeriodExists: boolean = false;
  activityPeriod: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supabase: SupabaseService,
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const result = await this.supabase.getMeritById(Number(id));

      if (result) {
        this.merit = result;
        this.getSanitizedPreviewUrls();
        this.getActivityPeriodText();
        this.activityPeriod = this.getActivityPeriod();
      } else {
        this.router.navigate(['/merits']);
      }
      this.loading = false;
    } else {
      this.router.navigate(['/merits']);
    }
  }

  setSafeDescription(html: string) {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
  prevImage() {
    if (this.selectedImageIndex > 0) {
      this.selectedImageIndex--;
    }
  }

  nextImage() {
    if (this.selectedImageIndex < this.merit.image_urls.length - 1) {
      this.selectedImageIndex++;
    }
  }

  onBack() {
    window.history.back();
  }

  onEdit() {
    this.router.navigate([`/merits/${this.getMeritId()}/edit`]);
  }

  async onDelete() {
    if (!confirm('Are you sure you want to delete this item?')) return;
    this.loading = true;
    try {
      await this.supabase.deleteMerit(this.getMeritId());
      for (const url of this.merit.image_urls) {
        await this.deleteImageFromStorage(url);
      }
      this.openSnackBar('Merit deleted successfully');
      this.loading = false;
      this.router.navigate(['/merits']);
    } catch (err: any) {
      this.openSnackBar('Failed to delete merit: ' + err.message);
    }
  }

  async deleteImageFromStorage(fullUrl: string): Promise<void> {
    try {
      await this.supabase.deleteImageFromStorage(fullUrl);
    } catch (err) {
      console.error('Error deleting image from storage:', err);
    }
  }

  getMeritId() {
    return this.merit.id ? this.merit.id : '';
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
    });
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('auth') === 'true';
  }

  private extractFileId(url: string): string | null {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)\//);
    return match ? match[1] : null;
  }

  getSanitizedPreviewUrls(): any {
    const urls: [] = this.merit.video_urls || [];
    if (!urls.length) return [];
    this.videoUrls = urls
      .map((url) => {
        const fileId = this.extractFileId(url);
        if (!fileId) return null;
        const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
        return this.sanitizer.bypassSecurityTrustResourceUrl(previewUrl);
      })
      .filter((url): url is SafeResourceUrl => url !== null);
  }

  getStatusLabel(value: string): string {
    const option = this.statusOptions.find((o) => o.value === value);
    return option ? option.label : value;
  }

  getActivityPeriod(): string | null {
    const startDate = this.merit.activity_start_date;
    const endDate = this.merit.activity_end_date;

    if (!startDate && !endDate) this.activityPeriodExists = false;

    const padDay = (day: number) => day.toString().padStart(2, '0');

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const startYear = start.getFullYear();
      const startMonth = start.getMonth();
      const startDay = padDay(start.getDate());

      const endYear = end.getFullYear();
      const endMonth = end.getMonth();
      let endDay = padDay(end.getDate());

      if (startYear === endYear && startMonth === endMonth) {
        // same year, same month
        return `${startYear} ${this.getSinhalaMonth(
          startMonth
        )} ${startDay} ~ ${endDay}`;
      }

      if (startYear === endYear) {
        // same year, different month
        return `${startYear} ${this.getSinhalaMonth(
          startMonth
        )} ${startDay} ~ ${this.getSinhalaMonth(endMonth)} ${endDay}`;
      }

      // different years
      return `${startYear} ${this.getSinhalaMonth(
        startMonth
      )} ${startDay} ~ ${endYear} ${this.getSinhalaMonth(endMonth)} ${endDay}`;
    }

    if (startDate) {
      const start = new Date(startDate);
      return `${start.getFullYear()} ${this.getSinhalaMonth(
        start.getMonth()
      )} ${padDay(start.getDate())}`;
    }

    // edge case: only endDate
    const end = new Date(endDate!);
    return `${end.getFullYear()} ${this.getSinhalaMonth(
      end.getMonth()
    )} ${end.getDate()}`;
  }

  getSinhalaMonth(monthIndex: number): string {
    return sinhalaMonths[monthIndex];
  }

  getActivityPeriodText() {
    this.activityPeriodText = this.checkDateStatus(
      this.merit.activity_start_date,
      this.merit.activity_end_date
    );
  }

  formatSinhalaDate(dateString: string): string {
    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = sinhalaMonths[date.getMonth()];
    const day = String(date.getDate()).padStart(2, '0');

    return `${year} ${month} ${day}`;
  }

  checkDateStatus(startDateStr: string, endDateStr?: string): any {
    const todayStr = formatDateWithoutTimezone(new Date());

    if (!startDateStr && !endDateStr) {
      this.activityPeriodExists = false;
    }
    this.activityPeriodExists = true;
    if (endDateStr) {
      // ✅ Case 1: range
      if (endDateStr < todayStr) {
        return 'කළ';
      } else if (startDateStr > todayStr) {
        return 'කරන';
      } else {
        return 'කරන';
      }
    } else {
      // ✅ Case 2: only start date
      if (startDateStr === todayStr) {
        return 'කරන';
      } else if (startDateStr < todayStr) {
        return 'කළ';
      } else {
        return 'කරන';
      }
    }
  }
}
