import { Component, EventEmitter, Input, Output, ViewChild, ElementRef, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificacaoService } from '../../../core/services/notificacao.service';
import { CategoriaAnexo } from '../../../domains/pessoa-idosa/domain/value-objects/enums';
import { CATEGORIA_ANEXO_LISTA } from '../../constants/app.constants';
import { AnexoProps } from '../../../domains/pessoa-idosa/domain/value-objects/anexo.vo';

@Component({
  selector: 'app-anexo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './anexo-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnexoFormComponent {
  @Input() form!: FormGroup;
  @Input() anexosExistentes: AnexoProps[] = [];
  @Input() maxSizeMb: number = 5; // tamanho máximo padrão em MB
  @Input() allowedTypes: string[] = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.doc', '.docx', '.xls', '.xlsx'];
  @Input() multiple: boolean = false;
  @ViewChild('fileInput') fileInputRef?: ElementRef<HTMLInputElement>;
  private fb = inject(FormBuilder);
  private notificacaoService = inject(NotificacaoService);

  @Input() anexo?: AnexoProps;
  @Output() save = new EventEmitter<AnexoProps>();
  @Output() cancel = new EventEmitter<void>();
  @Output() filesSelected = new EventEmitter<File[]>();

  categorias = CATEGORIA_ANEXO_LISTA;
  arquivoSelecionado: File | null = null;
  categoriaSelecionada: CategoriaAnexo | null = null;
  
  constructor() {
    this.form = this.fb.group({
      categoria: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    if (this.anexo) {
      this.form.patchValue(this.anexo);
    }
  }

  selecionarCategoria(categoriaId: CategoriaAnexo): void {
    this.categoriaSelecionada = categoriaId;
    this.form.patchValue({ categoria: categoriaId });
    
    // Abre automaticamente o seletor de arquivo (sem acessar document diretamente)
    this.fileInputRef?.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    const maxBytes = this.maxSizeMb * 1024 * 1024;

    const invalid = files.find(f => f.size > maxBytes);
    if (invalid) {
      this.notificacaoService.mostrarErro(`O arquivo "${invalid.name}" excede ${this.maxSizeMb}MB.`);
      return;
    }

    // Mantém compatibilidade: seleciona o primeiro para fluxo atual
    this.arquivoSelecionado = files[0] ?? null;

    // Emite lista completa para novos consumidores
    this.filesSelected.emit(files);

    // Fluxo atual: salva automaticamente após selecionar (single)
    if (this.arquivoSelecionado) {
      this.aoSalvar();
    }
  }

  categoriaJaPreenchida(categoriaId: CategoriaAnexo): boolean {
    return this.anexosExistentes.some(anexo => anexo.categoria === categoriaId);
  }

  obterCategoriaSelecionada() {
    return this.categorias.find(cat => cat.id === this.categoriaSelecionada);
  }

  aoSalvar(): void {
    if (!this.categoriaSelecionada) {
      this.notificacaoService.mostrarAviso('Selecione uma categoria.');
      return;
    }
    if (!this.arquivoSelecionado) {
      this.notificacaoService.mostrarErro('Selecione um arquivo para enviar.');
      return;
    }

    const anexoProps: Partial<AnexoProps> = {
      categoria: this.categoriaSelecionada,
    };

    this.save.emit({ ...anexoProps, file: this.arquivoSelecionado } as any);
  }

  get acceptAttr(): string {
    return this.allowedTypes.join(',');
  }
}