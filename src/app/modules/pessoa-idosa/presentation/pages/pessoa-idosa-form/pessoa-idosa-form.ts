import { Component, inject, OnInit, ChangeDetectionStrategy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PessoaIdosaFacade } from '../../../application/pessoa-idosa.facade';
import { MainMenuComponent } from '../../../../../shared/components/main-menu/main-menu';
import { ModalComponent } from '../../../../../shared/components/modal/modal';
import { PessoaIdosa } from '../../../domain/entities/pessoa-idosa.entity';
import { Dependente } from '../../../../dependente/domain/entities/dependente.entity';
import { firstValueFrom } from 'rxjs';
import { DependenteFormComponent } from '../../../../../modules/dependente/presentation/pages/dependente-form/dependente-form';
import { AnexoService } from '../../../../../shared';
import { EnderecoFormComponent, AnexoFormComponent } from '../../../../../shared';
import { NotificacaoService } from '../../../../../core/services/notificacao.service';
import { cpfValidator, rgValidator, cepValidator, telefoneValidator, dataNascimentoValidator } from '../../../../../shared/utils/validators.util';
import { Endereco } from '../../../domain/value-objects/endereco.vo';
import { ComposicaoFamiliar } from '../../../domain/value-objects/composicao-familiar.vo';
import { Anexo } from '../../../domain/value-objects/anexo.vo';
import { 
  CATEGORIAS_ANEXO, 
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
import { MaskDirective } from '../../../../../shared/directives/mask.directive';

@Component({
  selector: 'app-pessoas-idosas-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MainMenuComponent, DependenteFormComponent, ModalComponent, EnderecoFormComponent, AnexoFormComponent, MaskDirective],
  templateUrl: './pessoa-idosa-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PessoaIdosaFormPage implements OnInit {
  @ViewChild('anexoForm') anexoForm!: AnexoFormComponent;
  
  private fb = inject(FormBuilder);
  private pessoas = inject(PessoaIdosaFacade);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notificationService = inject(NotificacaoService);

  form: FormGroup;
  loading = false;
  error: string | null = null;
  editMode = false;
  pessoaId: string | null = null;

  dependentes: Dependente[] = [];
  mostrarFormularioDependente = false;
  indiceEdicaoDependente: number | undefined = undefined;
  valorEdicaoDependente: Dependente | undefined = undefined;
  mostrarModalRemocao = false;
  indiceDependenteParaRemover: number | null = null;

  anexos: any[] = [];
  categoriasAnexo = CATEGORIAS_ANEXO;
  tipoAnexoSelecionado: number | null = null;
  arquivoAnexoSelecionado: File | null = null;
  carregandoUploadAnexo = false;
  erroUploadAnexo: string | null = null;
  tipoAnexoParaRemover: number | null = null;
  mostrarModalRemocaoAnexo = false;

  private anexoService = inject(AnexoService);
  private cdr = inject(ChangeDetectorRef);

  estadosCivis = ESTADO_CIVIL_OPCOES;
  moradias = MORADIAS_OPCOES;
  carregandoBuscaCep = false;
  erroBuscaCep: string | null = null;
  
  situacoesOcupacionais = SITUACOES_OCUPACIONAIS_OPCOES;
  aposentados = APOSENTADO_OPCOES;
  rendas = RENDAS_OPCOES;
  beneficios = BENEFICIOS_OPCOES;
  deficiencias = DEFICIENCIA_OPCOES;
  niveisSerie = ESCOLARIDADE_OPCOES;
  cursosFormacao = TIPO_FORMACAO_PROFISSIONAL_OPCOES;
  problemasSaude = PROBLEMA_DE_SAUDE_OPCOES;

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
      const pessoa = await firstValueFrom(this.pessoas.obterPorId(this.pessoaId));
      if (pessoa) {
        const cf = pessoa.composicaoFamiliar || ({} as any);
        this.form.patchValue({
          nome: pessoa.nome,
          dataNascimento: pessoa.dataNascimento ? new Date(pessoa.dataNascimento).toISOString().slice(0, 10) : '',
          estadoCivil: pessoa.estadoCivil,
          cpf: pessoa.cpf,
          rg: pessoa.rg,
          orgaoEmissor: pessoa.orgaoEmissor,
          telefone: pessoa.telefone,
          naturalidade: pessoa.naturalidade,
          prontuarioSaude: pessoa.prontuarioSaude,
          religiao: pessoa.religiao,
          situacaoOcupacional: cf.situacaoOcupacional ?? (pessoa as any).situacaoOcupacional ?? '',
          aposentado: cf.aposentado ?? (pessoa as any).aposentado ?? '',
          renda: cf.renda ?? (pessoa as any).renda ?? '',
          aposentadoConsegueSeManterComSuaRenda: pessoa.aposentadoConsegueSeManterComSuaRenda ?? false,
          comoComplementa: pessoa.comoComplementa ?? (cf as any).comoComplementa ?? '',
          beneficio: pessoa.beneficio ?? cf.beneficio ?? '',
          alfabetizado: cf.alfabetizado ?? (pessoa as any).alfabetizado ?? false,
          nivelSerieAtualConcluido: cf.nivelSerieAtualConcluido ?? (pessoa as any).nivelSerieAtualConcluido ?? '',
          cursosTecnicoFormacaoProfissional: cf.cursosTecnicoFormacaoProfissional ?? (pessoa as any).cursosTecnicoFormacaoProfissional ?? '',
          estudaAtualmente: cf.estudaAtualmente ?? (pessoa as any).estudaAtualmente ?? false,
          deficiencia: cf.deficiencia ?? (pessoa as any).deficiencia ?? '',
          problemaDeSaude: cf.problemaDeSaude ?? (pessoa as any).problemaDeSaude ?? '',
          fazAlgumTratamento: cf.fazAlgumTratamento ?? (pessoa as any).fazAlgumTratamento ?? false,
          fazAlgumTratamentoOnde: cf.fazAlgumTratamentoOnde ?? (pessoa as any).fazAlgumTratamentoOnde ?? '',
          usaMedicamentoControlado: cf.usaMedicamentoControlado ?? (pessoa as any).usaMedicamentoControlado ?? false,
          usaRecursosUbsLocal: cf.usaRecursosUbsLocal ?? (pessoa as any).usaRecursosUbsLocal ?? false,
          trabalhoPastoralOuSocial: cf.trabalhoPastoralOuSocial ?? (pessoa as any).trabalhoPastoralOuSocial ?? '',
          atividadeNaComunidadeSagradaFamilia: cf.atividadeNaComunidadeSagradaFamilia ?? (pessoa as any).atividadeNaComunidadeSagradaFamilia ?? '',
          trabalhoVoluntario: cf.trabalhoVoluntario ?? (pessoa as any).trabalhoVoluntario ?? '',
          trabalhoVoluntarioOnde: cf.trabalhoVoluntarioOnde ?? (pessoa as any).trabalhoVoluntarioOnde ?? '',
          observacao: pessoa.observacao ?? '',
          historicoFamiliarSocial: pessoa.historicoFamiliarSocial ?? '',
          endereco: {
            cep: pessoa.endereco?.cep ?? '',
            moradia: pessoa.endereco?.moradia ?? '',
            logradouro: pessoa.endereco?.logradouro ?? '',
            numero: pessoa.endereco?.numero ?? '',
            bairro: pessoa.endereco?.bairro ?? '',
            cidade: pessoa.endereco?.cidade ?? '',
            estado: pessoa.endereco?.estado ?? ''
          }
        });
        this.form.get('observacao')?.setValue(pessoa.observacao ?? '');
        this.form.get('historicoFamiliarSocial')?.setValue(pessoa.historicoFamiliarSocial ?? '');
        this.dependentes = pessoa.dependentes || [];
        this.anexos = pessoa.anexos || [];
        setTimeout(() => { this.cdr.detectChanges(); }, 0);
      }
    } catch (error) {
      this.error = 'Erro ao carregar dados da pessoa.';
      console.error('Erro ao carregar pessoa:', error);
    } finally {
      this.loading = false;
    }
  }

  onEnderecoChange(endereco: any) { this.form.patchValue({ endereco }); }
  abrirNovoDependente() { this.indiceEdicaoDependente = undefined; this.valorEdicaoDependente = undefined; this.mostrarFormularioDependente = true; }
  editarDependente(indice: number) { this.indiceEdicaoDependente = indice; this.valorEdicaoDependente = { ...this.dependentes[indice] }; this.mostrarFormularioDependente = true; }
  salvarDependente(dependente: Dependente) { if (this.indiceEdicaoDependente !== undefined) { this.dependentes[this.indiceEdicaoDependente] = dependente; } else { this.dependentes.push(dependente); } this.mostrarFormularioDependente = false; this.indiceEdicaoDependente = undefined; this.valorEdicaoDependente = undefined; }
  cancelarDependente() { this.mostrarFormularioDependente = false; this.indiceEdicaoDependente = undefined; this.valorEdicaoDependente = undefined; }
  confirmarRemoverDependente(indice: number) { this.indiceDependenteParaRemover = indice; this.mostrarModalRemocao = true; }
  removerDependente() { if (this.indiceDependenteParaRemover !== null) { this.dependentes.splice(this.indiceDependenteParaRemover, 1); this.indiceDependenteParaRemover = null; } this.mostrarModalRemocao = false; }
  cancelarRemoverDependente() { this.indiceDependenteParaRemover = null; this.mostrarModalRemocao = false; }

  private configurarValidacoesCondicionais() {
    const aposentadoConsegueSeManterControl = this.form.get('aposentadoConsegueSeManterComSuaRenda');
    const comoComplementaControl = this.form.get('comoComplementa');
    if (aposentadoConsegueSeManterControl && comoComplementaControl) {
      this.atualizarEstadoComoComplementa(aposentadoConsegueSeManterControl.value);
      aposentadoConsegueSeManterControl.valueChanges.subscribe(value => this.atualizarEstadoComoComplementa(value));
    }
    const fazAlgumTratamentoControl = this.form.get('fazAlgumTratamento');
    const fazAlgumTratamentoOndeControl = this.form.get('fazAlgumTratamentoOnde');
    if (fazAlgumTratamentoControl && fazAlgumTratamentoOndeControl) {
      this.atualizarEstadoFazAlgumTratamentoOnde(fazAlgumTratamentoControl.value);
      fazAlgumTratamentoControl.valueChanges.subscribe(valor => this.atualizarEstadoFazAlgumTratamentoOnde(valor));
    }
    const trabalhoVoluntarioControl = this.form.get('trabalhoVoluntario');
    const trabalhoVoluntarioOndeControl = this.form.get('trabalhoVoluntarioOnde');
    if (trabalhoVoluntarioControl && trabalhoVoluntarioOndeControl) {
      this.atualizarEstadoTrabalhoVoluntarioOnde(trabalhoVoluntarioControl.value);
      trabalhoVoluntarioControl.valueChanges.subscribe(valor => this.atualizarEstadoTrabalhoVoluntarioOnde(valor));
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

  async aoSubmeter() {
    if (this.form.invalid) return;
    this.loading = true; this.error = null;
    try {
      const dadosPessoa = this.construirDadosPessoa();
      if (this.editMode && this.pessoaId) {
        await this.pessoas.atualizar(this.pessoaId, dadosPessoa);
        this.notificationService.mostrarSucesso('Pessoa idosa atualizada com sucesso!');
      } else {
        await this.pessoas.criar(dadosPessoa);
        this.notificationService.mostrarSucesso('Pessoa idosa cadastrada com sucesso!');
      }
      this.router.navigate(['/pessoa-idosa']);
    } catch {
      this.error = 'Erro ao salvar pessoa idosa.';
    } finally { this.loading = false; }
  }

  private construirDadosPessoa(): PessoaIdosa {
    const valores = this.form.value as any;
    return {
      id: this.pessoaId || '',
      dataCadastro: new Date(),
      nome: valores.nome,
      dataNascimento: valores.dataNascimento ? new Date(valores.dataNascimento) : new Date(),
      ativo: true,
      estadoCivil: valores.estadoCivil,
      cpf: valores.cpf,
      rg: valores.rg,
      orgaoEmissor: valores.orgaoEmissor,
      religiao: valores.religiao,
      naturalidade: valores.naturalidade,
      telefone: valores.telefone,
      prontuarioSaude: valores.prontuarioSaude,
      aposentadoConsegueSeManterComSuaRenda: !!valores.aposentadoConsegueSeManterComSuaRenda,
      comoComplementa: valores.comoComplementa || '',
      beneficio: valores.beneficio || '',
      observacao: valores.observacao || '',
      historicoFamiliarSocial: valores.historicoFamiliarSocial || '',
      composicaoFamiliar: this.construirComposicaoFamiliar(valores),
      endereco: this.construirEndereco(valores.endereco),
      dependentes: this.dependentes,
      anexos: this.anexos.map(a => Anexo.criar({ categoria: a.categoria, url: a.url, path: a.path, nomeArquivo: a.nomeArquivo }))
    };
  }
  private construirComposicaoFamiliar(valores: any) {
    return ComposicaoFamiliar.criar({
      alfabetizado: !!valores.alfabetizado,
      estudaAtualmente: !!valores.estudaAtualmente,
      nivelSerieAtualConcluido: valores.nivelSerieAtualConcluido || '',
      cursosTecnicoFormacaoProfissional: valores.cursosTecnicoFormacaoProfissional || '',
      situacaoOcupacional: valores.situacaoOcupacional || '',
      renda: valores.renda || '',
      aposentado: valores.aposentado || '',
      beneficio: valores.beneficio || '',
      deficiencia: valores.deficiencia || '',
      problemaDeSaude: valores.problemaDeSaude || '',
      fazAlgumTratamento: !!valores.fazAlgumTratamento,
      fazAlgumTratamentoOnde: valores.fazAlgumTratamentoOnde || '',
      usaMedicamentoControlado: !!valores.usaMedicamentoControlado,
      usaRecursosUbsLocal: !!valores.usaRecursosUbsLocal,
      trabalhoPastoralOuSocial: valores.trabalhoPastoralOuSocial || '',
      atividadeNaComunidadeSagradaFamilia: valores.atividadeNaComunidadeSagradaFamilia || '',
      trabalhoVoluntario: valores.trabalhoVoluntario || '',
      trabalhoVoluntarioOnde: valores.trabalhoVoluntarioOnde || '',
    });
  }
  private construirEndereco(endereco: any) {
    return Endereco.criar({
      cep: endereco?.cep || '',
      logradouro: endereco?.logradouro || '',
      numero: endereco?.numero || '',
      estado: endereco?.estado || '',
      cidade: endereco?.cidade || '',
      bairro: endereco?.bairro || '',
      moradia: endereco?.moradia || '',
    });
  }
  voltarParaLista() { this.router.navigate(['/pessoa-idosa']); }
  async aoUploadAnexo(evento: { categoria: number, arquivo: File }) { this.carregandoUploadAnexo = true; this.erroUploadAnexo = null; try { const pessoaId = this.pessoaId || 'novo'; const { url, path } = await this.anexoService.uploadAnexo(pessoaId, evento.categoria, evento.arquivo); this.anexos = this.anexos.filter(anexo => anexo.categoria !== evento.categoria); this.anexos.push({ categoria: evento.categoria, url, path, nomeArquivo: evento.arquivo.name }); if (this.anexoForm) { this.anexoForm.atualizarArquivoSelecionado(evento.categoria, evento.arquivo.name); } } catch (erro: any) { this.erroUploadAnexo = erro.message || 'Erro ao fazer upload.'; if (this.anexoForm) { this.anexoForm.limparArquivoSelecionado(evento.categoria); } } this.carregandoUploadAnexo = false; }
  async aoRemoverAnexo(anexo: any) { this.carregandoUploadAnexo = true; try { await this.anexoService.deletarAnexo(anexo.path); this.anexos = this.anexos.filter(anexoItem => anexoItem.categoria !== anexo.categoria); if (this.anexoForm) { this.anexoForm.limparArquivoSelecionado(anexo.categoria); } } catch { this.erroUploadAnexo = 'Erro ao remover anexo.'; } this.carregandoUploadAnexo = false; }
  async aoBaixarAnexo(anexo: any) { try { window.open(anexo.url, '_blank'); } catch { this.erroUploadAnexo = 'Erro ao baixar anexo.'; } }
}