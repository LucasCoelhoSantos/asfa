import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CATEGORIAS_ANEXO } from '../../constants/app.constants';
import { ModalComponent } from '../../components/modal/modal';
import { Anexo } from '../../../models/anexo.model';

@Component({
  selector: 'app-anexo-form',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './anexo-form.html',
  styleUrls: ['./anexo-form.scss']
})
export class AnexoFormComponent implements OnInit {
  @Input() anexos: Anexo[] = [];
  @Output() upload = new EventEmitter<{ categoria: number, arquivo: File }>();
  @Output() removerAnexo = new EventEmitter<Anexo>();
  @Output() baixarAnexo = new EventEmitter<Anexo>();

  categoriasAnexo = CATEGORIAS_ANEXO;
  
  private arquivosSelecionados: Map<number, { arquivo: File, nome: string }> = new Map();
  showRemoveModal = false;
  private anexoPendenteRemocao: Anexo | null = null;

  ngOnInit() {
    this.anexos.forEach(anexo => {
      if (anexo.nomeArquivo) {
        this.arquivosSelecionados.set(anexo.categoria, {
          arquivo: new File([], anexo.nomeArquivo),
          nome: anexo.nomeArquivo
        });
      }
    });
  }

  obterAnexo(categoriaId: number): Anexo | undefined {
    return this.anexos.find(a => a.categoria === categoriaId);
  }

  existeArquivo(categoriaId: number): boolean {
    return this.obterAnexo(categoriaId) !== undefined || this.arquivosSelecionados.has(categoriaId);
  }

  obterNomeDoArquivo(categoriaId: number): string {
    const anexo = this.obterAnexo(categoriaId);
    if (anexo?.nomeArquivo) {
      return anexo.nomeArquivo;
    }
    
    const arquivoSelectionado = this.arquivosSelecionados.get(categoriaId);
    if (arquivoSelectionado) {
      return arquivoSelectionado.nome;
    }
    
    return 'Arquivo enviado';
  }

  aoSelecionarArquivo(event: Event, categoria: number) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const allowed = ['image/png', 'image/jpeg', 'application/pdf'];
      if (!allowed.includes(file.type)) {
        alert('Tipo de arquivo não permitido. Use apenas PNG, JPEG ou PDF.');
        return;
      }
      
      this.arquivosSelecionados.set(categoria, {
        arquivo: file,
        nome: file.name
      });
      
      this.upload.emit({ categoria, arquivo: file });
    }
  }

  abrirConfirmacaoRemover(anexo: Anexo) {
    this.anexoPendenteRemocao = anexo;
    this.showRemoveModal = true;
  }

  cancelarRemover() {
    this.anexoPendenteRemocao = null;
    this.showRemoveModal = false;
  }

  confirmarRemover() {
    if (!this.anexoPendenteRemocao) return;
    this.arquivosSelecionados.delete(this.anexoPendenteRemocao.categoria);
    this.removerAnexo.emit(this.anexoPendenteRemocao);
    this.anexoPendenteRemocao = null;
    this.showRemoveModal = false;
  }

  baixar(anexo: Anexo) {
    this.baixarAnexo.emit(anexo);
  }

  limparArquivoSelecionado(categoria: number) {
    this.arquivosSelecionados.delete(categoria);
  }

  atualizarArquivoSelecionado(categoria: number, nomeArquivo: string) {
    this.arquivosSelecionados.set(categoria, {
      arquivo: new File([], nomeArquivo),
      nome: nomeArquivo
    });
  }
}