import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { lastValueFrom } from 'rxjs';
import { STORAGE_PORT, StoragePort, UploadResultado } from '../../ports/storage.port';
import { Anexo } from '../../../domains/pessoa-idosa/domain/value-objects/anexo.vo';
import { CATEGORIAS_ANEXO } from '../../constants/app.constants'; 

interface CategoriaAnexo {
  readonly id: number;
  readonly categoria: number;
  readonly label: string;
  readonly icon: string;
  readonly class: string;
}

@Component({
  selector: 'app-anexo-form',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './anexo-form.html',
  styleUrls: ['./anexo-form.scss']
})
export class AnexoFormComponent {
  private storagePort: StoragePort = inject(STORAGE_PORT);

  @Input() anexos: Anexo[] = [];
  @Output() anexosChange = new EventEmitter<Anexo[]>();

  public readonly categorias = CATEGORIAS_ANEXO;
  public uploadEmAndamento: { [categoriaId: number]: boolean } = {};

  // Método auxiliar para encontrar um anexo existente para uma categoria
  public getAnexoPorCategoria(categoriaId: number): Anexo | undefined {
    return this.anexos.find(anexo => anexo.categoria === categoriaId);
  }

  async onFileSelected(event: Event, categoria: CategoriaAnexo): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const anexoExistente = this.getAnexoPorCategoria(categoria.id);
    if (anexoExistente) {
      await this.removerAnexo(anexoExistente);
    }

    const arquivo = input.files[0];
    this.uploadEmAndamento[categoria.id] = true;

    try {
      const caminho = `anexos/${Date.now()}_${arquivo.name}`;
      const resultado: UploadResultado = await lastValueFrom(
        this.storagePort.upload(arquivo, caminho)
      );
      
      const novoAnexo = Anexo.criar({
        categoria: categoria.id,
        nomeArquivo: arquivo.name,
        url: resultado.url,
        path: resultado.path
      });

      this.anexos = [...this.anexos, novoAnexo];
      this.anexosChange.emit(this.anexos);

    } catch (error) {
      console.error(`Erro no upload para a categoria ${categoria.label}:`, error);
    } finally {
      this.uploadEmAndamento[categoria.id] = false;
      input.value = '';
    }
  }

  async removerAnexo(anexoParaRemover: Anexo): Promise<void> {
    if (!confirm(`Tem certeza que deseja remover o anexo "${anexoParaRemover.nomeArquivo}"?`)) {
      return;
    }

    this.uploadEmAndamento[anexoParaRemover.categoria] = true;
    try {
      await lastValueFrom(this.storagePort.delete(anexoParaRemover.path));
      
      this.anexos = this.anexos.filter(anexo => anexo.path !== anexoParaRemover.path);
      this.anexosChange.emit(this.anexos);

    } catch (error) {
      console.error('Erro ao remover anexo:', error);
    } finally {
        this.uploadEmAndamento[anexoParaRemover.categoria] = false;
    }
  }
}