import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Dependente, DependenteProps } from '../../../domain/entities/dependente.entity';
import { ComposicaoFamiliar } from '../../../../pessoa-idosa/domain/value-objects/composicao-familiar.vo';
import { NotificacaoService } from '../../../../../core/services/notificacao.service';
import {
  ESTADO_CIVIL_OPCOES,
  APOSENTADO_OPCOES,
  BENEFICIO_OPCOES,
  DEFICIENCIA_OPCOES,
  ESCOLARIDADE_OPCOES,
  PROBLEMA_DE_SAUDE_OPCOES,
  RENDA_OPCOES,
  SITUACAO_OCUPACIONAL_OPCOES,
  TIPO_FORMACAO_PROFISSIONAL_OPCOES
} from '../../../../../shared';

@Component({
  selector: 'app-dependente-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dependente-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DependenteFormComponent implements OnInit, OnChanges {
  @Input() form!: FormGroup;
  private fb = inject(FormBuilder);
  private notificacaoService = inject(NotificacaoService);

  @Input() dependente?: Dependente | DependenteProps;
  @Output() save = new EventEmitter<DependenteProps>();
  @Output() cancel = new EventEmitter<void>();

  estadoCivilOpcoes = ESTADO_CIVIL_OPCOES;
  beneficioOpcoes = BENEFICIO_OPCOES;
  situacaoOcupacionalOpcoes = SITUACAO_OCUPACIONAL_OPCOES;
  aposentadoOpcoes = APOSENTADO_OPCOES;
  rendaOpcoes = RENDA_OPCOES;
  nivelSerieAtualConcluidoOpcoes = ESCOLARIDADE_OPCOES;
  cursosTecnicoFormacaoProfissionalOpcoes = TIPO_FORMACAO_PROFISSIONAL_OPCOES;
  deficienciaOpcoes = DEFICIENCIA_OPCOES;
  problemaDeSaudeOpcoes = PROBLEMA_DE_SAUDE_OPCOES;

  constructor() {
    this.form = this.fb.group({
      id: [null],
      nome: ['', [Validators.required, Validators.minLength(3)]],
      dataNascimento: ['', [Validators.required]],
      parentesco: ['', [Validators.required]],
      estadoCivil: ['', [Validators.required]],
      ceinf: [''],
      ceinfBairro: [''],
      programaSaudePastoralCrianca: [''],
      programaSaudePastoralCriancaLocal: [''],
      ativo: [true],
      alfabetizado: [false],
      estudaAtualmente: [false],
      nivelSerieAtualConcluido: ['', [Validators.required]],
      cursosTecnicoFormacaoProfissional: ['', [Validators.required]],
      situacaoOcupacional: ['', [Validators.required]],
      renda: ['', [Validators.required]],
      aposentado: ['', [Validators.required]],
      beneficio: ['', [Validators.required]],
      deficiencia: ['', [Validators.required]],
      problemaDeSaude: ['', [Validators.required]],
      fazAlgumTratamento: [false],
      fazAlgumTratamentoOnde: [''],
      usaMedicamentoControlado: [false],
      usaRecursosUbsLocal: [false],
      trabalhoPastoralOuSocial: ['', [Validators.required]],
      atividadeNaComunidadeSagradaFamilia: ['', [Validators.required]],
      trabalhoVoluntario: ['', [Validators.required]],
      trabalhoVoluntarioOnde: [''],
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
      const dep: any = this.dependente as any;
      const value = typeof dep?.toJSON === 'function' ? dep.toJSON() : dep;
      const { composicaoFamiliar, ...resto } = value || {};
      const camposComposicao = composicaoFamiliar ?? {};
      this.form.patchValue({ ...resto, ...camposComposicao });
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
    const formValue = this.form.value;
    const {
      estadoCivil,
      alfabetizado,
      estudaAtualmente,
      nivelSerieAtualConcluido,
      cursosTecnicoFormacaoProfissional, 
      situacaoOcupacional,
      renda,
      aposentado,
      beneficio,
      deficiencia,
      problemaDeSaude, 
      fazAlgumTratamento,
      fazAlgumTratamentoOnde,
      usaMedicamentoControlado,
      usaRecursosUbsLocal, 
      trabalhoPastoralOuSocial,
      atividadeNaComunidadeSagradaFamilia,
      trabalhoVoluntario,
      trabalhoVoluntarioOnde,
      ...resto
    } = formValue;
    
    const dependenteProps: DependenteProps = {
      ...resto,
      composicaoFamiliar: ComposicaoFamiliar.criar({
        estadoCivil,
        alfabetizado,
        estudaAtualmente,
        nivelSerieAtualConcluido,
        cursosTecnicoFormacaoProfissional,
        situacaoOcupacional,
        renda,
        aposentado,
        beneficio,
        deficiencia,
        problemaDeSaude,
        fazAlgumTratamento,
        fazAlgumTratamentoOnde,
        usaMedicamentoControlado,
        usaRecursosUbsLocal,
        trabalhoPastoralOuSocial,
        atividadeNaComunidadeSagradaFamilia,
        trabalhoVoluntario,
        trabalhoVoluntarioOnde
      })
    };

    this.save.emit(dependenteProps);
  }

  aoCancelar(): void {
    this.cancel.emit();
  }
}