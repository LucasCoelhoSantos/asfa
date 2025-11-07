import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageThumbnailComponent } from '../image-thumbnail/image-thumbnail';

export interface AnexoItem {
  file?: File;
  url?: string;
  categoria: string | number; // compatível com CategoriaAnexo
}

@Component({
  selector: 'app-anexo-list',
  standalone: true,
  imports: [CommonModule, ImageThumbnailComponent],
  templateUrl: './anexo-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnexoListComponent {
  @Input() itens: ReadonlyArray<AnexoItem> = [];
  @Input() categoriasInfo: Record<string | number, { icon: string; label: string } > = {};
  @Input() thumbSize = 50;

  @Output() editar = new EventEmitter<number>();
  @Output() remover = new EventEmitter<number>();

  trackByIndex(index: number) {
    return index;
  }
}