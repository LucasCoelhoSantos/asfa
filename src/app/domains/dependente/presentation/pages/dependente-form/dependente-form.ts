import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Dependente, DependenteProps } from '../../../domain/entities/dependente.entity';
import { NotificacaoService } from '../../../../../core/services/notificacao.service';

@Component({
    selector: 'app-dependente-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './dependente-form.html'
})
export class DependenteFormComponent implements OnInit, OnChanges {
    @Input() dependente?: Dependente;
    @Output() save = new EventEmitter<DependenteProps>();
    @Output() cancel = new EventEmitter<void>();

    private fb = inject(FormBuilder);
    private notificacaoService = inject(NotificacaoService);

    form: FormGroup;

    constructor() {
        this.form = this.fb.group({
            id: [null],
            nome: ['', [Validators.required, Validators.minLength(3)]],
            dataNascimento: ['', [Validators.required]],
            parentesco: ['', [Validators.required]],
            ceinf: [''],
            ceinfBairro: [''],
            programaSaudePastoralCrianca: [''],
            programaSaudePastoralCriancaLocal: [''],
            ativo: [true],
        });
    }

    ngOnInit(): void {
        this.preencherFormulario();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['dependente']) {
            this.preencherFormulario();
        }
    }

    private preencherFormulario(): void {
        if (this.dependente) {
            this.form.patchValue(this.dependente.toJSON());
        } else {
            this.form.reset({ ativo: true });
        }
    }

    aoEnviar(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.notificacaoService.mostrarAviso('Preencha os campos obrigatórios do dependente.');
            return;
        }
        this.save.emit(this.form.value);
    }

    aoCancelar(): void {
        this.cancel.emit();
    }
}