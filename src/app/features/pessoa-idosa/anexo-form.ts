import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TIPOS_ANEXO } from '../../shared/constants/app.constants';

export interface Anexo {
  tipoAnexo: number;
  url: string;
  path: string;
  nomeArquivo?: string;
}

@Component({
  selector: 'app-anexo-form',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="anexos-container">
      <div *ngFor="let tipo of tiposAnexo" class="anexo-item" [class.has-file]="hasFile(tipo.id)">
        <div class="anexo-header">
          <h4 class="anexo-title">
            <span class="icon">{{ tipo.icon }}</span>
            {{ tipo.label }}
          </h4>
          <span class="anexo-status" [class.uploaded]="hasFile(tipo.id)" [class.not-uploaded]="!hasFile(tipo.id)">
            {{ hasFile(tipo.id) ? 'Arquivo Enviado' : 'Pendente' }}
          </span>
        </div>
        
        <div class="upload-area">
          <div class="file-input-group">
            <div class="file-input-wrapper">
              <input type="file" accept=".png,.jpeg,.jpg,.pdf" (change)="onFileSelected($event, tipo.id)" />
              <button type="button" class="file-input-button">
                <span class="icon">📁</span>
                {{ hasFile(tipo.id) ? 'Alterar Arquivo' : 'Selecionar Arquivo' }}
              </button>
            </div>
            
            <div class="file-info" [class.has-file]="hasFile(tipo.id)">
              <ng-container *ngIf="hasFile(tipo.id); else noFile">
                <span class="icon">✅</span>
                {{ getFileName(tipo.id) }}
              </ng-container>
              <ng-template #noFile>
                <span class="icon">📄</span>
                Nenhum arquivo selecionado
              </ng-template>
            </div>
          </div>
          
          <div class="file-actions" *ngIf="hasFile(tipo.id)">
            <button type="button" class="btn-download" (click)="baixar(getAnexo(tipo.id)!)" title="Baixar arquivo">
              <span class="icon">⬇️</span>
              Baixar
            </button>
            <button type="button" class="btn-remove" (click)="remover(getAnexo(tipo.id)!)" title="Remover arquivo">
              <span class="icon">🗑️</span>
              Remover
            </button>
          </div>
        </div>
        
        <div class="file-details" *ngIf="hasFile(tipo.id)">
          <div class="file-name">
            <span class="icon">📎</span>
            {{ getFileName(tipo.id) }}
          </div>
          <div class="file-meta">
            <div class="meta-item">
              <span class="icon">📅</span>
              Enviado
            </div>
            <div class="meta-item">
              <span class="icon">📏</span>
              Arquivo válido
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./anexo-form.scss']
})
export class AnexoFormComponent implements OnInit {
  @Input() anexos: Anexo[] = [];
  @Output() upload = new EventEmitter<{ tipoAnexo: number, file: File }>();
  @Output() removerAnexo = new EventEmitter<Anexo>();
  @Output() baixarAnexo = new EventEmitter<Anexo>();

  tiposAnexo = TIPOS_ANEXO;
  
  // Estado local para arquivos selecionados temporariamente
  private selectedFiles: Map<number, { file: File, name: string }> = new Map();

  ngOnInit() {
    // Inicializar arquivos selecionados com base nos anexos existentes
    this.anexos.forEach(anexo => {
      if (anexo.nomeArquivo) {
        this.selectedFiles.set(anexo.tipoAnexo, {
          file: new File([], anexo.nomeArquivo),
          name: anexo.nomeArquivo
        });
      }
    });
  }

  getAnexo(tipoId: number): Anexo | undefined {
    return this.anexos.find(a => a.tipoAnexo === tipoId);
  }

  hasFile(tipoId: number): boolean {
    return this.getAnexo(tipoId) !== undefined || this.selectedFiles.has(tipoId);
  }

  getFileName(tipoId: number): string {
    const anexo = this.getAnexo(tipoId);
    if (anexo?.nomeArquivo) {
      return anexo.nomeArquivo;
    }
    
    const selectedFile = this.selectedFiles.get(tipoId);
    if (selectedFile) {
      return selectedFile.name;
    }
    
    return 'Arquivo enviado';
  }

  onFileSelected(event: Event, tipoAnexo: number) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const allowed = ['image/png', 'image/jpeg', 'application/pdf'];
      if (!allowed.includes(file.type)) {
        alert('Tipo de arquivo não permitido. Use apenas PNG, JPEG ou PDF.');
        return;
      }
      
      // Adicionar ao estado local para feedback imediato
      this.selectedFiles.set(tipoAnexo, {
        file: file,
        name: file.name
      });
      
      // Emitir evento para o componente pai
      this.upload.emit({ tipoAnexo, file });
    }
  }

  remover(anexo: Anexo) {
    if (confirm('Tem certeza que deseja remover este arquivo?')) {
      // Remover do estado local
      this.selectedFiles.delete(anexo.tipoAnexo);
      this.removerAnexo.emit(anexo);
    }
  }

  baixar(anexo: Anexo) {
    this.baixarAnexo.emit(anexo);
  }

  // Método público para limpar o estado local de um arquivo específico
  clearSelectedFile(tipoAnexo: number) {
    this.selectedFiles.delete(tipoAnexo);
  }

  // Método público para atualizar o estado local quando um anexo é processado
  updateSelectedFile(tipoAnexo: number, nomeArquivo: string) {
    this.selectedFiles.set(tipoAnexo, {
      file: new File([], nomeArquivo),
      name: nomeArquivo
    });
  }
} 