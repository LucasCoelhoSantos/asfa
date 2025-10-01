import { Component, inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { PessoaIdosaFacade } from '../../../application/pessoa-idosa.facade';
import { CriarPessoaIdosaProps, AtualizarPessoaIdosaProps } from '../../../domain/entities/pessoa-idosa.entity';
import { Dependente } from '../../../../dependente/domain/entities/dependente.entity';
import { Endereco } from '../../../domain/value-objects/endereco.vo';
import { ComposicaoFamiliar } from '../../../domain/value-objects/composicao-familiar.vo';
import { Anexo } from '../../../domain/value-objects/anexo.vo';

import { MainMenuComponent } from '../../../../../shared/components/main-menu/main-menu';
import { ModalComponent } from '../../../../../shared/components/modal/modal';
import { DependenteFormComponent } from '../../../../../domains/dependente/presentation/pages/dependente-form/dependente-form';
import { EnderecoFormComponent, AnexoFormComponent } from '../../../../../shared';
import { NotificacaoService } from '../../../../../core/services/notificacao.service';
import { cpfValidator, rgValidator, cepValidator, telefoneValidator, dataNascimentoValidator } from '../../../../../shared/utils/validators.util';
import { MaskDirective } from '../../../../../shared/directives/mask.directive';
import { 
  ESTADO_CIVIL_OPCOES, 
  MORADIAS_OPCOES,
  SITUACOES_OCUPACIONAIS_OPCOES,
  APOSENTADO_OPCOES,
  RENDAS_OPCOES,
  BENEFICIOS_OPCOES,
  DEFICIENCIA_OPCOES,
  ESCOLARIDADE_OPCOES,
  TIPO_FORMACAO_PROFISSIONAL_OPCOES,
  PROBLEMA_DE_SAUDE_OPCOES
} from '../../../../../shared/constants/app.constants';

@Component({
  selector: 'app-pessoas-idosas-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MainMenuComponent, DependenteFormComponent, ModalComponent, EnderecoFormComponent, AnexoFormComponent, MaskDirective],
  templateUrl: './pessoa-idosa-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PessoaIdosaFormPage implements OnInit {
  private fb = inject(FormBuilder);
  private facade = inject(PessoaIdosaFacade);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notificationService = inject(NotificacaoService);
  private cdr = inject(ChangeDetectorRef);

  form: FormGroup;
  loading = false;
  error: string | null = null;
  editMode = false;
  pessoaId: string | null = null;

  // Gerenciamento de Dependentes
  dependentes: Dependente[] = [];
  mostrarFormularioDependente = false;
  indiceEdicaoDependente: number | undefined = undefined;
  valorEdicaoDependente: Dependente | undefined = undefined;
  mostrarModalRemocao = false;
  indiceDependenteParaRemover: number | null = null;

  // Gerenciamento de Anexos (simplificado)
  anexos: Anexo[] = [];

  // Constantes para o Template
  readonly estadosCivis = ESTADO_CIVIL_OPCOES;
  readonly moradias = MORADIAS_OPCOES;
  readonly situacoesOcupacionais = SITUACOES_OCUPACIONAIS_OPCOES;
  readonly aposentados = APOSENTADO_OPCOES;
  readonly rendas = RENDAS_OPCOES;
  readonly beneficios = BENEFICIOS_OPCOES;
  readonly deficiencias = DEFICIENCIA_OPCOES;
  readonly niveisSerie = ESCOLARIDADE_OPCOES;
  readonly cursosFormacao = TIPO_FORMACAO_PROFISSIONAL_OPCOES;
  readonly problemasSaude = PROBLEMA_DE_SAUDE_OPCOES;

  constructor() {
    this.form = this.fb.group({
      nome: ['', [Validators.required]],
      dataNascimento: ['', [Validators.required, dataNascimentoValidator]],
      estadoCivil: ['', [Validators.required]],
      cpf: ['', [Validators.required, cpfValidator]],
      rg: ['', [rgValidator]],
      orgaoEmissor: ['', [Validators.required]],
      telefone: ['', [Validators.required, telefoneValidator]],
      naturalidade: ['', [Validators.required]],
      prontuarioSaude: ['', [Validators.required]],
      religiao: ['', [Validators.required]],
      situacaoOcupacional: ['', [Validators.required]],
      aposentado: ['', [Validators.required]],
      renda: ['', [Validators.required]],
      aposentadoConsegueSeManterComSuaRenda: [false, [Validators.required]],
      comoComplementa: [''],
      beneficio: [''],
      alfabetizado: [false, [Validators.required]],
      nivelSerieAtualConcluido: ['', [Validators.required]],
      cursosTecnicoFormacaoProfissional: ['', [Validators.required]],
      estudaAtualmente: [false, [Validators.required]],
      deficiencia: ['', [Validators.required]],
      problemaDeSaude: ['', [Validators.required]],
      fazAlgumTratamento: [false, [Validators.required]],
      fazAlgumTratamentoOnde: [''],
      usaMedicamentoControlado: [false, [Validators.required]],
      usaRecursosUbsLocal: [false, [Validators.required]],
      trabalhoPastoralOuSocial: ['', [Validators.required]],
      atividadeNaComunidadeSagradaFamilia: ['', [Validators.required]],
      trabalhoVoluntario: ['', [Validators.required]],
      trabalhoVoluntarioOnde: [''],
      observacao: [''],
      historicoFamiliarSocial: [''],
      endereco: this.fb.group({
        cep: ['', [Validators.required, cepValidator]],
        moradia: ['', [Validators.required]],
        logradouro: ['', [Validators.required]],
        numero: ['', [Validators.required]],
        bairro: ['', [Validators.required]],
        cidade: ['', [Validators.required]],
        estado: ['', [Validators.required]]
      })
    });

    this.configurarValidacoesCondicionais();
  }

  ngOnInit() {
    this.pessoaId = this.route.snapshot.paramMap.get('id');
    this.editMode = !!this.pessoaId;
    
    if (this.editMode && this.pessoaId) {
      this.carregarPessoa();
    }
  }

  async carregarPessoa() {
    if (!this.pessoaId) return;
    
    this.loading = true;
    try {
      const pessoa = await firstValueFrom(this.facade.obterPorId(this.pessoaId));
      if (pessoa) {
        const cf = pessoa.composicaoFamiliar;
        this.form.patchValue({
          nome: pessoa.nome,
          dataNascimento: new Date(pessoa.dataNascimento).toISOString().slice(0, 10),
          estadoCivil: pessoa.estadoCivil,
          cpf: pessoa.cpf,
          rg: pessoa.rg,
          orgaoEmissor: pessoa.orgaoEmissor,
          telefone: pessoa.telefone,
          naturalidade: pessoa.naturalidade,
          prontuarioSaude: pessoa.prontuarioSaude,
          religiao: pessoa.religiao,
          aposentadoConsegueSeManterComSuaRenda: pessoa.aposentadoConsegueSeManterComSuaRenda,
          comoComplementa: pessoa.comoComplementa,
          beneficio: pessoa.beneficio,
          observacao: pessoa.observacao,
          historicoFamiliarSocial: pessoa.historicoFamiliarSocial,
          // Campos da Composição Familiar
          situacaoOcupacional: cf.situacaoOcupacional,
          aposentado: cf.aposentado,
          renda: cf.renda,
          alfabetizado: cf.alfabetizado,
          nivelSerieAtualConcluido: cf.nivelSerieAtualConcluido,
          cursosTecnicoFormacaoProfissional: cf.cursosTecnicoFormacaoProfissional,
          estudaAtualmente: cf.estudaAtualmente,
          deficiencia: cf.deficiencia,
          problemaDeSaude: cf.problemaDeSaude,
          fazAlgumTratamento: cf.fazAlgumTratamento,
          fazAlgumTratamentoOnde: cf.fazAlgumTratamentoOnde,
          usaMedicamentoControlado: cf.usaMedicamentoControlado,
          usaRecursosUbsLocal: cf.usaRecursosUbsLocal,
          trabalhoPastoralOuSocial: cf.trabalhoPastoralOuSocial,
          atividadeNaComunidadeSagradaFamilia: cf.atividadeNaComunidadeSagradaFamilia,
          trabalhoVoluntario: cf.trabalhoVoluntario,
          trabalhoVoluntarioOnde: cf.trabalhoVoluntarioOnde,
          endereco: { ...pessoa.endereco }
        });

        this.dependentes = [...pessoa.dependentes];
        this.anexos = [...pessoa.anexos];
        this.cdr.markForCheck();
      }
    } catch (error) {
      this.error = 'Erro ao carregar dados da pessoa.';
      console.error('Erro ao carregar pessoa:', error);
    } finally {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  async aoSubmeter() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notificationService.mostrarErro('Formulário inválido. Verifique os campos marcados.');
      return;
    }

    this.loading = true;
    this.error = null;
    
    try {
      const dadosDoFormulario = this.construirProps();
      
      if (this.editMode && this.pessoaId) {
        await this.facade.atualizar(this.pessoaId, dadosDoFormulario);
        this.notificationService.mostrarSucesso('Pessoa idosa atualizada com sucesso!');
      } else {
        await this.facade.criar(dadosDoFormulario as CriarPessoaIdosaProps);
        this.notificationService.mostrarSucesso('Pessoa idosa cadastrada com sucesso!');
      }
      this.router.navigate(['/pessoa-idosa']);

    } catch(err) {
      this.error = 'Erro ao salvar pessoa idosa.';
      console.error(err);
    } finally {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  private construirProps(): CriarPessoaIdosaProps | AtualizarPessoaIdosaProps {
    const formValues = this.form.getRawValue();
    return {
      nome: formValues.nome,
      dataNascimento: new Date(formValues.dataNascimento),
      estadoCivil: formValues.estadoCivil,
      cpf: formValues.cpf,
      rg: formValues.rg,
      orgaoEmissor: formValues.orgaoEmissor,
      religiao: formValues.religiao,
      naturalidade: formValues.naturalidade,
      telefone: formValues.telefone,
      prontuarioSaude: formValues.prontuarioSaude,
      aposentadoConsegueSeManterComSuaRenda: formValues.aposentadoConsegueSeManterComSuaRenda,
      comoComplementa: formValues.comoComplementa,
      beneficio: formValues.beneficio,
      observacao: formValues.observacao,
      historicoFamiliarSocial: formValues.historicoFamiliarSocial,
      composicaoFamiliar: ComposicaoFamiliar.criar({
          alfabetizado: formValues.alfabetizado,
          estudaAtualmente: formValues.estudaAtualmente,
          nivelSerieAtualConcluido: formValues.nivelSerieAtualConcluido,
          cursosTecnicoFormacaoProfissional: formValues.cursosTecnicoFormacaoProfissional,
          situacaoOcupacional: formValues.situacaoOcupacional,
          renda: formValues.renda,
          aposentado: formValues.aposentado,
          beneficio: formValues.beneficio,
          deficiencia: formValues.deficiencia,
          problemaDeSaude: formValues.problemaDeSaude,
          fazAlgumTratamento: formValues.fazAlgumTratamento,
          fazAlgumTratamentoOnde: formValues.fazAlgumTratamentoOnde,
          usaMedicamentoControlado: formValues.usaMedicamentoControlado,
          usaRecursosUbsLocal: formValues.usaRecursosUbsLocal,
          trabalhoPastoralOuSocial: formValues.trabalhoPastoralOuSocial,
          atividadeNaComunidadeSagradaFamilia: formValues.atividadeNaComunidadeSagradaFamilia,
          trabalhoVoluntario: formValues.trabalhoVoluntario,
          trabalhoVoluntarioOnde: formValues.trabalhoVoluntarioOnde,
      }),
      endereco: Endereco.criar({ ...formValues.endereco }),
      dependentes: this.dependentes,
      anexos: this.anexos,
    } as any;
  }

  // --- Lógica de Dependentes (sem alterações) ---
  abrirNovoDependente() { this.indiceEdicaoDependente = undefined; this.valorEdicaoDependente = undefined; this.mostrarFormularioDependente = true; }
  editarDependente(indice: number) { this.indiceEdicaoDependente = indice; this.valorEdicaoDependente = { ...this.dependentes[indice] }; this.mostrarFormularioDependente = true; }
  salvarDependente(dependente: Dependente) { if (this.indiceEdicaoDependente !== undefined) { this.dependentes[this.indiceEdicaoDependente] = dependente; } else { this.dependentes.push(dependente); } this.mostrarFormularioDependente = false; this.indiceEdicaoDependente = undefined; this.valorEdicaoDependente = undefined; }
  cancelarDependente() { this.mostrarFormularioDependente = false; this.indiceEdicaoDependente = undefined; this.valorEdicaoDependente = undefined; }
  confirmarRemoverDependente(indice: number) { this.indiceDependenteParaRemover = indice; this.mostrarModalRemocao = true; }
  removerDependente() { if (this.indiceDependenteParaRemover !== null) { this.dependentes.splice(this.indiceDependenteParaRemover, 1); this.indiceDependenteParaRemover = null; } this.mostrarModalRemocao = false; }
  cancelarRemoverDependente() { this.indiceDependenteParaRemover = null; this.mostrarModalRemocao = false; }

  // --- Validações Condicionais (sem alterações) ---
  private configurarValidacoesCondicionais() {
    const aposentadoConsegueSeManterControl = this.form.get('aposentadoConsegueSeManterComSuaRenda');
    const comoComplementaControl = this.form.get('comoComplementa');
    if (aposentadoConsegueSeManterControl && comoComplementaControl) {
      aposentadoConsegueSeManterControl.valueChanges.subscribe(value => this.atualizarEstadoComoComplementa(value));
      this.atualizarEstadoComoComplementa(aposentadoConsegueSeManterControl.value);
    }
    const fazAlgumTratamentoControl = this.form.get('fazAlgumTratamento');
    const fazAlgumTratamentoOndeControl = this.form.get('fazAlgumTratamentoOnde');
    if (fazAlgumTratamentoControl && fazAlgumTratamentoOndeControl) {
      fazAlgumTratamentoControl.valueChanges.subscribe(valor => this.atualizarEstadoFazAlgumTratamentoOnde(valor));
      this.atualizarEstadoFazAlgumTratamentoOnde(fazAlgumTratamentoControl.value);
    }
    const trabalhoVoluntarioControl = this.form.get('trabalhoVoluntario');
    const trabalhoVoluntarioOndeControl = this.form.get('trabalhoVoluntarioOnde');
    if (trabalhoVoluntarioControl && trabalhoVoluntarioOndeControl) {
      trabalhoVoluntarioControl.valueChanges.subscribe(valor => this.atualizarEstadoTrabalhoVoluntarioOnde(valor));
      this.atualizarEstadoTrabalhoVoluntarioOnde(trabalhoVoluntarioControl.value);
    }
  }

  private atualizarEstadoComoComplementa(value: boolean) {
    const comoComplementaControl = this.form.get('comoComplementa');
    if (comoComplementaControl) {
      if (value === false) { comoComplementaControl.setValidators([Validators.required]); comoComplementaControl.enable(); }
      else { comoComplementaControl.clearValidators(); comoComplementaControl.disable(); comoComplementaControl.setValue(''); }
      comoComplementaControl.updateValueAndValidity();
    }
  }

  private atualizarEstadoFazAlgumTratamentoOnde(value: boolean) {
    const ctrl = this.form.get('fazAlgumTratamentoOnde');
    if (ctrl) { if (value === true) { ctrl.setValidators([Validators.required]); ctrl.enable(); } else { ctrl.clearValidators(); ctrl.disable(); ctrl.setValue(''); } ctrl.updateValueAndValidity(); }
  }

  private atualizarEstadoTrabalhoVoluntarioOnde(value: string) {
    const ctrl = this.form.get('trabalhoVoluntarioOnde');
    if (ctrl) { if (value && value.trim() !== '') { ctrl.setValidators([Validators.required]); ctrl.enable(); } else { ctrl.clearValidators(); ctrl.disable(); ctrl.setValue(''); } ctrl.updateValueAndValidity(); }
  }

  voltarParaLista() { this.router.navigate(['/pessoa-idosa']); }

  get enderecoForm(): FormGroup {
    return this.form.get('endereco') as FormGroup;
  }
}