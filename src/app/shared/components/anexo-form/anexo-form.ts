import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificacaoService } from '../../../core/services/notificacao.service';
import { CategoriaAnexo } from '../../../domains/pessoa-idosa/domain/value-objects/enums';
import { CATEGORIAS_ANEXO_LISTA } from '../../constants/app.constants';
import { AnexoProps } from '../../../domains/pessoa-idosa/domain/value-objects/anexo.vo';

@Component({
    selector: 'app-anexo-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './anexo-form.html',
    styleUrls: ['./anexo-form.scss']
})
export class AnexoFormComponent {
    private fb = inject(FormBuilder);
    private notificacaoService = inject(NotificacaoService);

    @Input() anexo?: AnexoProps;
    @Output() save = new EventEmitter<AnexoProps>();
    @Output() cancel = new EventEmitter<void>();

    form: FormGroup;
    categorias = CATEGORIAS_ANEXO_LISTA;
    arquivoSelecionado: File | null = null;
    
    constructor() {
        this.form = this.fb.group({
            nome: ['', [Validators.required]],
            categoria: [null, [Validators.required]],
            // URL e Path não são campos de formulário, são gerados no upload
        });
    }

    ngOnInit(): void {
        if (this.anexo) {
            this.form.patchValue(this.anexo);
        }
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];
            if (file.size > 5 * 1024 * 1024) {
                this.notificacaoService.mostrarErro('O arquivo não pode exceder 5MB.');
                return;
            }
            this.arquivoSelecionado = file;
            this.form.patchValue({ nome: file.name });
        }
    }

    aoSalvar(): void {
        if (this.form.invalid) {
            this.notificacaoService.mostrarAviso('Preencha todos os campos do anexo.');
            return;
        }
        if (!this.arquivoSelecionado) {
            this.notificacaoService.mostrarErro('Selecione um arquivo para enviar.');
            return;
        }

        // O componente pai será responsável por fazer o upload e preencher 'url' e 'path'
        const anexoProps: Partial<AnexoProps> = {
            nome: this.form.value.nome,
            categoria: this.form.value.categoria as CategoriaAnexo,
        };

        // Aqui emitimos o arquivo junto com os dados para o componente pai
        this.save.emit({ ...anexoProps, file: this.arquivoSelecionado } as any);
    }
}