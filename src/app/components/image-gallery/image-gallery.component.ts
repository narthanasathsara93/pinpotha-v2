import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { ImageDialogComponent } from '../image-dialog/image-dialog.component';

@Component({
  selector: 'app-image-gallery',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './image-gallery.component.html',
  styleUrl: './image-gallery.component.scss',
})
export class ImageGalleryComponent {
   @Input() images: string[] = [];

  constructor(private dialog: MatDialog) {}

  openImageDialog(imageUrl: string) {
    this.dialog.open(ImageDialogComponent, {
      data: { imageUrl },
      panelClass: 'custom-dialog-container',
      maxWidth: '90vw',
      maxHeight: '90vh',
    });
  }
}
