import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Anexo {
  tipoAnexo: number;
  url: string;
  path: string;
  nomeArquivo?: string;
}

const TIPOS_ANEXO = [
  { id: 1, label: 'CPF' },
  { id: 2, label: 'RG' },
  { id: 3, label: 'Comprovante Endereço' },
  { id: 4, label: 'Foto Cartão SUS' },
  { id: 5, label: 'Cadastro NIS' },
  { id: 6, label: 'Termo Autorização' }
];

@Component({
  selector: 'app-anexo-form',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="anexos-container">
      <div *ngFor="let tipo of tiposAnexo" class="anexo-item">
        <label>{{ tipo.label }}
          <input type="file" accept=".png,.jpeg,.jpg,.pdf" (change)="onFileSelected($event, tipo.id)" />
        </label>
        <ng-container *ngIf="getAnexo(tipo.id) as anexo">
          <span class="anexo-nome">{{ anexo.nomeArquivo || 'Arquivo enviado' }}</span>
          <button type="button" (click)="baixar(anexo)">Baixar</button>
          <button type="button" (click)="remover(anexo)">Remover</button>
        </ng-container>
        <ng-container *ngIf="!getAnexo(tipo.id)">
          <span class="anexo-nome">Nenhum arquivo enviado</span>
        </ng-container>
      </div>
    </div>
  `,
  styleUrls: ['./anexo-form.component.scss']
})
export class AnexoFormComponent {
  @Input() anexos: Anexo[] = [];
  @Output() upload = new EventEmitter<{ tipoAnexo: number, file: File }>();
  @Output() removerAnexo = new EventEmitter<Anexo>();
  @Output() baixarAnexo = new EventEmitter<Anexo>();

  tiposAnexo = TIPOS_ANEXO;

  getAnexo(tipoId: number): Anexo | undefined {
    return this.anexos.find(a => a.tipoAnexo === tipoId);
  }

  onFileSelected(event: Event, tipoAnexo: number) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const allowed = ['image/png', 'image/jpeg', 'application/pdf'];
      if (!allowed.includes(file.type)) {
        alert('Tipo de arquivo não permitido.');
        return;
      }
      this.upload.emit({ tipoAnexo, file });
    }
  }

  remover(anexo: Anexo) {
    this.removerAnexo.emit(anexo);
  }

  baixar(anexo: Anexo) {
    this.baixarAnexo.emit(anexo);
  }
} 