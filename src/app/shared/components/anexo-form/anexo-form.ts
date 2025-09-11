import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TIPOS_ANEXO } from '../../constants/app.constants';
import { ModalComponent } from '../../components/modal/modal';
import { Anexo } from '../../../models/pessoa-idosa.model';

/**
 * Componente reutilizável para upload e gerenciamento de anexos
 * Suporta múltiplos tipos de anexo com validação
 * Usado em: Pessoa Idosa Form, potencialmente outros formulários
 */
@Component({
  selector: 'app-anexo-form',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  template: `
    <div class="anexos-container">
      <div *ngFor="let tipo of tiposAnexo" class="anexo-item" [class.has-file]="hasFile(tipo.id)">
        <div class="anexo-header">
          <h4 class="anexo-title">
            <i [class]="tipo.icon"></i>
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
                <i class="bi bi-folder2-open"></i>
                {{ hasFile(tipo.id) ? 'Alterar Arquivo' : 'Selecionar Arquivo' }}
              </button>
            </div>
            
            <div class="file-info" [class.has-file]="hasFile(tipo.id)">
              <ng-container *ngIf="hasFile(tipo.id); else noFile">
                <i class="bi bi-check-circle-fill text-success"></i>
                {{ getFileName(tipo.id) }}
              </ng-container>
              <ng-template #noFile>
                <i class="bi bi-file-earmark-text"></i>
                Nenhum arquivo selecionado
              </ng-template>
            </div>
          </div>
          
          <div class="file-actions" *ngIf="hasFile(tipo.id)">
            <button type="button" class="btn-download" (click)="baixar(getAnexo(tipo.id)!)" title="Baixar arquivo">
              <i class="bi bi-download"></i>
              Baixar
            </button>
            <button type="button" class="btn-remove" (click)="openRemoveConfirm(getAnexo(tipo.id)!)" title="Remover arquivo">
              <i class="bi bi-trash"></i>
              Remover
            </button>
          </div>
        </div>
        
        <div class="file-details" *ngIf="hasFile(tipo.id)">
          <div class="file-name">
            <i class="bi bi-paperclip"></i>
            {{ getFileName(tipo.id) }}
          </div>
          <div class="file-meta">
            <div class="meta-item">
              <i class="bi bi-calendar-check"></i>
              Enviado
            </div>
            <div class="meta-item">
              <i class="bi bi-check-circle"></i>
              Arquivo válido
            </div>
          </div>
        </div>
      </div>
    </div>

    <app-modal 
      [show]="showRemoveModal" 
      [title]="'Remover arquivo'" 
      [message]="'Tem certeza que deseja remover este arquivo?'"
      [confirmText]="'Remover'"
      [cancelText]="'Cancelar'"
      (confirm)="confirmRemove()"
      (cancel)="cancelRemove()"
    ></app-modal>
  `,
  styleUrls: ['./anexo-form.scss']
})
export class AnexoFormComponent implements OnInit {
  @Input() anexos: Anexo[] = [];
  @Output() upload = new EventEmitter<{ tipoAnexo: number, file: File }>();
  @Output() removerAnexo = new EventEmitter<Anexo>();
  @Output() baixarAnexo = new EventEmitter<Anexo>();

  tiposAnexo = TIPOS_ANEXO;
  
  private selectedFiles: Map<number, { file: File, name: string }> = new Map();
  showRemoveModal = false;
  private anexoPendenteRemocao: Anexo | null = null;

  ngOnInit() {
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
      
      this.selectedFiles.set(tipoAnexo, {
        file: file,
        name: file.name
      });
      
      this.upload.emit({ tipoAnexo, file });
    }
  }

  openRemoveConfirm(anexo: Anexo) {
    this.anexoPendenteRemocao = anexo;
    this.showRemoveModal = true;
  }

  cancelRemove() {
    this.anexoPendenteRemocao = null;
    this.showRemoveModal = false;
  }

  confirmRemove() {
    if (!this.anexoPendenteRemocao) return;
    this.selectedFiles.delete(this.anexoPendenteRemocao.tipoAnexo);
    this.removerAnexo.emit(this.anexoPendenteRemocao);
    this.anexoPendenteRemocao = null;
    this.showRemoveModal = false;
  }

  baixar(anexo: Anexo) {
    this.baixarAnexo.emit(anexo);
  }

  clearSelectedFile(tipoAnexo: number) {
    this.selectedFiles.delete(tipoAnexo);
  }

  updateSelectedFile(tipoAnexo: number, nomeArquivo: string) {
    this.selectedFiles.set(tipoAnexo, {
      file: new File([], nomeArquivo),
      name: nomeArquivo
    });
  }
}
