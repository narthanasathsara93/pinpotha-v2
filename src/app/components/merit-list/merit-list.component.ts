import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { ImageService } from './../../services/image.service';
import { Merit } from '../../models/merits.model';
import { ActivatedRoute, Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { options, statusOptions } from '../../util/options';
import { ScrollPositionService } from '../../services/scroll.service';
import { StripHtmlPipe } from '../../pipe/strip-html.pipe';
export interface Option {
  label: string;
  value: string;
}

@Component({
  selector: 'app-merit-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatOptionModule,
    MatPaginatorModule,
    DatePipe,
    StripHtmlPipe,
  ],
  templateUrl: './merit-list.component.html',
  styleUrl: './merit-list.component.scss',
})
export class MeritListComponent {
  merits: Merit[] = [];
  loading = false;
  error = '';
  types: Option[] = options;

  private _selectedType = '';

  defaultPageSize = 100;
  pageSize = this.defaultPageSize;
  pageIndex = 0;
  totalCount = 0;
  pageSizeOptions = [5, 10, 20, 30, 40, 50, 100];

  defaultImageUrl = '';
  defaultColumn = 'type';

  statusOptions: Option[] = statusOptions;
  public _selectedStatus: string = 'DONE';

  isOtherPage: boolean = false;

  constructor(
    private supabase: SupabaseService,
    private router: Router,
    private route: ActivatedRoute,
    private imageService: ImageService,
    private scrollService: ScrollPositionService
  ) {}

  ngOnInit() {
    this.route.url.subscribe((url) => {
      if (url.some((segment) => segment.path === 'other')) {
        this.isOtherPage = true;
        this.selectedStatus = 'PROMISED';
      }
    });

    this.route.queryParams.subscribe((params) => {
      this._selectedType = params['type'] || '';
      this.pageIndex = +params['page'] || 0;
      this.pageSize = +params['size'] || this.defaultPageSize;
      this.loadMerits();
    });

    this.defaultImageUrl = this.imageService.getImageByName("lotus_icon.jpg");
  }

  async loadMerits() {
    this.loading = true;
    try {
      const { data, count } = await this.supabase.getMeritsPaged(
        this.pageIndex,
        this.pageSize,
        this.defaultColumn,
        this._selectedStatus,
        this._selectedType
      );

      this.merits = data;
      this.totalCount = count;

      if (this.scrollService.scrollY > 0) {
        setTimeout(() => {
          window.scrollTo(0, this.scrollService.scrollY);
          this.scrollService.scrollY = 0;
        });
      }
    } catch (e: any) {
      this.error = e.message || 'Failed to load merits';
    } finally {
      this.loading = false;
    }
  }

  get selectedType() {
    return this._selectedType;
  }

  set selectedType(value: string) {
    this._selectedType = value;
    this.pageIndex = 0;
    this.updateQueryParams();
  }

  get selectedStatus() {
    return this._selectedStatus;
  }

  set selectedStatus(value: string) {
    this._selectedStatus = value;
    this.pageIndex = 0;
    this.updateQueryParams(); // triggers reload
  }
  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updateQueryParams();
  }

  viewDetail(id: string) {
    this.scrollService.scrollY = window.scrollY;
    this.scrollService.pageIndex = this.pageIndex;
    this.router.navigate(['/merits', parseInt(id)]);
  }

  updateQueryParams() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        type: this._selectedType || null,
        page: this.pageIndex || null,
        size: this.pageSize || null,
      },
      queryParamsHandling: 'merge',
    });

    this.loadMerits();
  }
}
