import { Injectable } from '@angular/core';

export interface ImageResizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

@Injectable({ providedIn: 'root' })
export class ImageResizeService {
  
  /**
   * Redimensiona uma imagem para criar uma miniatura otimizada
   */
  async resizeImage(file: File, options: ImageResizeOptions = {}): Promise<string> {
    const {
      maxWidth = 200,
      maxHeight = 200,
      quality = 0.8,
      format = 'jpeg'
    } = options;

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcula as novas dimensões mantendo a proporção
        let { width, height } = this.calculateDimensions(
          img.width, 
          img.height, 
          maxWidth, 
          maxHeight
        );

        // Define o tamanho do canvas
        canvas.width = width;
        canvas.height = height;

        // Desenha a imagem redimensionada
        ctx?.drawImage(img, 0, 0, width, height);

        // Converte para base64 com qualidade otimizada
        const dataUrl = canvas.toDataURL(`image/${format}`, quality);
        resolve(dataUrl);
      };

      img.onerror = () => reject(new Error('Erro ao carregar a imagem'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Cria uma miniatura otimizada para preview
   */
  async createThumbnail(file: File): Promise<string> {
    return this.resizeImage(file, {
      maxWidth: 200,
      maxHeight: 200,
      quality: 0.7,
      format: 'jpeg'
    });
  }

  /**
   * Calcula as dimensões mantendo a proporção
   */
  private calculateDimensions(
    originalWidth: number, 
    originalHeight: number, 
    maxWidth: number, 
    maxHeight: number
  ): { width: number; height: number } {
    let width = originalWidth;
    let height = originalHeight;

    // Redimensiona se exceder a largura máxima
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    // Redimensiona se exceder a altura máxima
    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  /**
   * Verifica se o arquivo é uma imagem
   */
  isImage(file: File): boolean {
    return file.type.startsWith('image/');
  }

  /**
   * Obtém o tipo de arquivo baseado na extensão ou MIME type
   */
  getFileType(file: File | string): 'image' | 'pdf' | 'word' | 'excel' | 'other' {
    if (typeof file === 'string') {
      // URL string
      if (file.includes('.pdf') || file.includes('pdf')) return 'pdf';
      if (file.includes('.jpg') || file.includes('.jpeg') || file.includes('.png') || file.includes('.gif')) return 'image';
      if (file.includes('.doc') || file.includes('.docx')) return 'word';
      if (file.includes('.xls') || file.includes('.xlsx')) return 'excel';
      return 'other';
    } else {
      // File object
      if (file.type.includes('pdf')) return 'pdf';
      if (file.type.startsWith('image/')) return 'image';
      if (file.type.includes('word') || file.name.includes('.doc')) return 'word';
      if (file.type.includes('excel') || file.name.includes('.xls')) return 'excel';
      return 'other';
    }
  }
}
