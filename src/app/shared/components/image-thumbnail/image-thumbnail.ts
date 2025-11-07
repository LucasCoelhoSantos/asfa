import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageResizeService } from '../../services/image-resize.service';

@Component({
  selector: 'app-image-thumbnail',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-light border rounded d-flex align-items-center justify-content-center position-relative" 
         [style.width.px]="size" 
         [style.height.px]="size">
      
      <!-- Loading spinner -->
      @if (isLoading) {
        <div class="spinner-border spinner-border-sm text-primary" role="status">
          <span class="visually-hidden">Carregando...</span>
        </div>
      }
      
      <!-- Imagem redimensionada -->
      @if (thumbnailUrl && !isLoading) {
        <img [src]="thumbnailUrl" 
             [alt]="alt" 
             class="img-fluid rounded" 
             [style.max-width.px]="size" 
             [style.max-height.px]="size" 
             [style.object-fit]="'cover'"
             loading="lazy">
      }
      
      <!-- Ícone de fallback -->
      @if (!thumbnailUrl && !isLoading) {
        <i [class]="iconClass" [style.font-size.px]="iconSize"></i>
      }
      
      <!-- Erro de carregamento -->
      @if (hasError) {
        <i class="bi bi-exclamation-triangle text-warning" [style.font-size.px]="iconSize"></i>
      }
    </div>
  `
})
export class ImageThumbnailComponent implements OnInit, OnDestroy, OnChanges {
  @Input() file?: File;
  @Input() url?: string;
  @Input() size: number = 60;
  @Input() alt: string = 'Preview';
  @Input() fileType?: 'image' | 'pdf' | 'word' | 'excel' | 'other';

  private imageResizeService = inject(ImageResizeService);
  private cdr = inject(ChangeDetectorRef);
  
  thumbnailUrl: string | null = null;
  isLoading = false;
  hasError = false;
  iconClass = 'bi bi-file-earmark text-secondary';
  iconSize = 24;

  ngOnInit() {
    this.iconSize = Math.round(this.size * 0.4);
    this.loadThumbnail();
  }

  ngOnDestroy() {
    // Limpa a URL do objeto se foi criada
    if (this.thumbnailUrl && this.thumbnailUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.thumbnailUrl);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['file'] || changes['url']) {
      // Reinicia estado e recarrega sempre que a entrada mudar
      this.resetState();
      this.loadThumbnail();
    }
  }

  private resetState() {
    if (this.thumbnailUrl && this.thumbnailUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.thumbnailUrl);
    }
    this.thumbnailUrl = null;
    this.isLoading = false;
    this.hasError = false;
  }

  private async loadThumbnail() {
    if (this.file && this.imageResizeService.isImage(this.file)) {
      await this.loadFromFile();
    } else if (this.url) {
      await this.loadFromUrl();
    } else {
      this.setFallbackIcon();
    }
  }

  private async loadFromFile() {
    if (!this.file) return;
    
    this.isLoading = true;
    this.hasError = false;
    
    try {
      this.thumbnailUrl = await this.imageResizeService.createThumbnail(this.file);
    } catch (error) {
      console.error('Erro ao redimensionar imagem:', error);
      this.hasError = true;
      this.setFallbackIcon();
    } finally {
      this.isLoading = false;
        this.cdr.detectChanges();
    }
  }

  private async loadFromUrl() {
    if (!this.url) return;
    
    const fileType = this.imageResizeService.getFileType(this.url);
    
    if (fileType === 'image') {
      this.isLoading = true;
      this.hasError = false;
      
      try {
        // Para URLs, usamos a imagem diretamente (já deve estar otimizada no servidor)
        this.thumbnailUrl = this.url;
      } catch (error) {
        console.error('Erro ao carregar imagem da URL:', error);
        this.hasError = true;
        this.setFallbackIcon();
      } finally {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    } else {
      this.setFallbackIcon();
    }
  }

  private setFallbackIcon() {
    if (this.fileType) {
      this.iconClass = this.getIconClass(this.fileType);
    } else if (this.file) {
      const type = this.imageResizeService.getFileType(this.file);
      this.iconClass = this.getIconClass(type);
    } else if (this.url) {
      const type = this.imageResizeService.getFileType(this.url);
      this.iconClass = this.getIconClass(type);
    }
  }

  private getIconClass(type: 'image' | 'pdf' | 'word' | 'excel' | 'other'): string {
    switch (type) {
      case 'pdf':
        return 'bi bi-file-pdf text-danger';
      case 'word':
        return 'bi bi-file-word text-primary';
      case 'excel':
        return 'bi bi-file-excel text-success';
      case 'image':
        return 'bi bi-image text-info';
      default:
        return 'bi bi-file-earmark text-secondary';
    }
  }
}