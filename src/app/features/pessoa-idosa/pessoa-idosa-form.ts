import { Component, inject, OnInit, ChangeDetectionStrategy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PessoaIdosaService } from './pessoa-idosa.service';
import { MainMenuComponent } from '../../shared/main-menu/main-menu';
import { PessoaIdosa, Dependente } from '../../models/pessoa-idosa.model';
import { firstValueFrom } from 'rxjs';
import { DependenteFormComponent } from '../../features/dependente/dependente-form';
import { ModalComponent } from '../../shared/modal/modal';
import { AnexoService } from '../../shared';
import { EnderecoFormComponent, AnexoFormComponent } from '../../shared';
import { NotificationService } from '../../core/services/notification.service';
import { cpfValidator, rgValidator, cepValidator, telefoneValidator, dataNascimentoValidator } from '../../shared/utils/validators.util';
import { 
  TIPOS_ANEXO, 
  ESTADOS_CIVIS, 
  MORADIAS_OPTIONS,
  SITUACOES_OCUPACIONAIS_OPTIONS,
  APOSENTADOS_OPTIONS,
  RENDAS_OPTIONS,
  BENEFICIOS_OPTIONS,
  DEFICIENCIAS_OPTIONS,
  NIVEIS_SERIE_OPTIONS,
  CURSOS_FORMACAO_OPTIONS,
  PROBLEMAS_SAUDE_OPTIONS
} from '../../shared/constants/app.constants';
import { MaskDirective } from '../../shared/directives/mask.directive';

@Component({
  selector: 'app-pessoas-idosas-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MainMenuComponent, DependenteFormComponent, ModalComponent, EnderecoFormComponent, AnexoFormComponent, MaskDirective],
  templateUrl: './pessoa-idosa-form.html',
  //styleUrls: ['./pessoa-idosa-form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PessoaIdosaFormComponent implements OnInit {
  @ViewChild('anexoForm') anexoForm!: AnexoFormComponent;
  
  private fb = inject(FormBuilder);
  private pessoasService = inject(PessoaIdosaService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  form: FormGroup;
  loading = false;
  error: string | null = null;
  editMode = false;
  pessoaId: string | null = null;

  dependentes: Dependente[] = [];
  showDependenteForm = false;
  dependenteEditIndex: number | undefined = undefined;
  dependenteEditValue: Dependente | undefined = undefined;
  showRemoveModal = false;
  dependenteToRemoveIndex: number | null = null;

  anexos: any[] = [];
  tiposAnexo = TIPOS_ANEXO;
  anexoSelecionadoTipo: number | null = null;
  anexoSelecionadoFile: File | null = null;
  anexoUploadLoading = false;
  anexoUploadError: string | null = null;
  anexoRemoverTipo: number | null = null;
  showRemoveAnexoModal = false;

  private anexoService = inject(AnexoService);
  private cdr = inject(ChangeDetectorRef);

  estadosCivis = ESTADOS_CIVIS;
  moradias = MORADIAS_OPTIONS;
  cepBuscaLoading = false;
  cepBuscaErro: string | null = null;
  
  situacoesOcupacionais = SITUACOES_OCUPACIONAIS_OPTIONS;
  aposentados = APOSENTADOS_OPTIONS;
  rendas = RENDAS_OPTIONS;
  beneficios = BENEFICIOS_OPTIONS;
  deficiencias = DEFICIENCIAS_OPTIONS;
  niveisSerie = NIVEIS_SERIE_OPTIONS;
  cursosFormacao = CURSOS_FORMACAO_OPTIONS;
  problemasSaude = PROBLEMAS_SAUDE_OPTIONS;

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

    this.setupConditionalValidations();
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
      const pessoa = await firstValueFrom(this.pessoasService.getById(this.pessoaId));
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
        
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 0);
      }
    } catch (error) {
      this.error = 'Erro ao carregar dados da pessoa.';
      console.error('Erro ao carregar pessoa:', error);
    } finally {
      this.loading = false;
    }
  }

  onEnderecoChange(endereco: any) {
    this.form.patchValue({ endereco });
  }

  abrirNovoDependente() {
    this.dependenteEditIndex = undefined;
    this.dependenteEditValue = undefined;
    this.showDependenteForm = true;
  }

  editarDependente(index: number) {
    this.dependenteEditIndex = index;
    this.dependenteEditValue = { ...this.dependentes[index] };
    this.showDependenteForm = true;
  }

  salvarDependente(dependente: Dependente) {
    if (this.dependenteEditIndex !== undefined) {
      this.dependentes[this.dependenteEditIndex] = dependente;
    } else {
      this.dependentes.push(dependente);
    }
    
    this.showDependenteForm = false;
    this.dependenteEditIndex = undefined;
    this.dependenteEditValue = undefined;
  }

  cancelarDependente() {
    this.showDependenteForm = false;
    this.dependenteEditIndex = undefined;
    this.dependenteEditValue = undefined;
  }

  confirmarRemoverDependente(index: number) {
    this.dependenteToRemoveIndex = index;
    this.showRemoveModal = true;
  }

  removerDependente() {
    if (this.dependenteToRemoveIndex !== null) {
      this.dependentes.splice(this.dependenteToRemoveIndex, 1);
      this.dependenteToRemoveIndex = null;
    }
    this.showRemoveModal = false;
  }

  cancelarRemoverDependente() {
    this.dependenteToRemoveIndex = null;
    this.showRemoveModal = false;
  }

  getAnexoPorTipo(tipo: number): any | undefined {
    return this.anexos.find(a => a.tipoAnexo === tipo);
  }

  onSelecionarArquivo(tipo: number, event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (!this.anexoService.isFileAllowed(file)) {
        this.anexoUploadError = 'Tipo de arquivo não permitido.';
        return;
      }
      this.anexoSelecionadoTipo = tipo;
      this.anexoSelecionadoFile = file;
      this.anexoUploadError = null;
    }
  }

  async uploadAnexo(tipo: number) {
    if (!this.anexoSelecionadoFile || this.anexoSelecionadoTipo !== tipo) return;
    this.anexoUploadLoading = true;
    this.anexoUploadError = null;
    try {
      const pessoaId = this.pessoaId || 'novo';
      const { url, path } = await this.anexoService.uploadAnexo(pessoaId, tipo, this.anexoSelecionadoFile);
      this.anexos = this.anexos.filter(a => a.tipoAnexo !== tipo);
      this.anexos.push({ tipoAnexo: tipo, url, path });
      this.anexoSelecionadoFile = null;
      this.anexoSelecionadoTipo = null;
    } catch (e: any) {
      this.anexoUploadError = e.message || 'Erro ao fazer upload.';
    }
    this.anexoUploadLoading = false;
  }

  baixarAnexo(anexo: any) {
    window.open(anexo.url, '_blank');
  }

  confirmarRemoverAnexo(tipo: number) {
    this.anexoRemoverTipo = tipo;
    this.showRemoveAnexoModal = true;
  }

  async removerAnexoConfirmado() {
    if (this.anexoRemoverTipo !== null) {
      const anexo = this.getAnexoPorTipo(this.anexoRemoverTipo);
      if (anexo) {
        await this.anexoService.deleteAnexo(anexo.path);
        this.anexos = this.anexos.filter(a => a.tipoAnexo !== this.anexoRemoverTipo);
      }
    }
    this.showRemoveAnexoModal = false;
    this.anexoRemoverTipo = null;
  }

  cancelarRemoverAnexo() {
    this.showRemoveAnexoModal = false;
    this.anexoRemoverTipo = null;
  }

  private setupConditionalValidations() {
    const aposentadoConsegueSeManterControl = this.form.get('aposentadoConsegueSeManterComSuaRenda');
    const comoComplementaControl = this.form.get('comoComplementa');
    
    if (aposentadoConsegueSeManterControl && comoComplementaControl) {
      this.updateComoComplementaState(aposentadoConsegueSeManterControl.value);
      
      aposentadoConsegueSeManterControl.valueChanges.subscribe(value => {
        this.updateComoComplementaState(value);
      });
    }

    const fazAlgumTratamentoControl = this.form.get('fazAlgumTratamento');
    const fazAlgumTratamentoOndeControl = this.form.get('fazAlgumTratamentoOnde');
    
    if (fazAlgumTratamentoControl && fazAlgumTratamentoOndeControl) {
      this.updateFazAlgumTratamentoOndeState(fazAlgumTratamentoControl.value);
      
      fazAlgumTratamentoControl.valueChanges.subscribe(value => {
        this.updateFazAlgumTratamentoOndeState(value);
      });
    }

    const trabalhoVoluntarioControl = this.form.get('trabalhoVoluntario');
    const trabalhoVoluntarioOndeControl = this.form.get('trabalhoVoluntarioOnde');
    
    if (trabalhoVoluntarioControl && trabalhoVoluntarioOndeControl) {
      this.updateTrabalhoVoluntarioOndeState(trabalhoVoluntarioControl.value);
      
      trabalhoVoluntarioControl.valueChanges.subscribe(value => {
        this.updateTrabalhoVoluntarioOndeState(value);
      });
    }
  }

  private updateComoComplementaState(value: boolean) {
    const comoComplementaControl = this.form.get('comoComplementa');
    if (comoComplementaControl) {
      if (value === false) {
        comoComplementaControl.setValidators([Validators.required]);
        comoComplementaControl.enable();
      } else {
        comoComplementaControl.clearValidators();
        comoComplementaControl.disable();
        comoComplementaControl.setValue('');
      }
      comoComplementaControl.updateValueAndValidity();
    }
  }

  private updateFazAlgumTratamentoOndeState(value: boolean) {
    const fazAlgumTratamentoOndeControl = this.form.get('fazAlgumTratamentoOnde');
    if (fazAlgumTratamentoOndeControl) {
      if (value === true) {
        fazAlgumTratamentoOndeControl.setValidators([Validators.required]);
        fazAlgumTratamentoOndeControl.enable();
      } else {
        fazAlgumTratamentoOndeControl.clearValidators();
        fazAlgumTratamentoOndeControl.disable();
        fazAlgumTratamentoOndeControl.setValue('');
      }
      fazAlgumTratamentoOndeControl.updateValueAndValidity();
    }
  }

  private updateTrabalhoVoluntarioOndeState(value: string) {
    const trabalhoVoluntarioOndeControl = this.form.get('trabalhoVoluntarioOnde');
    if (trabalhoVoluntarioOndeControl) {
      if (value && value.trim() !== '') {
        trabalhoVoluntarioOndeControl.setValidators([Validators.required]);
        trabalhoVoluntarioOndeControl.enable();
      } else {
        trabalhoVoluntarioOndeControl.clearValidators();
        trabalhoVoluntarioOndeControl.disable();
        trabalhoVoluntarioOndeControl.setValue('');
      }
      trabalhoVoluntarioOndeControl.updateValueAndValidity();
    }
  }

  async buscarCep() {
    const cep = this.extractCepFromForm();
    if (!this.isValidCep(cep)) {
      this.setCepError('CEP inválido');
      return;
    }

    this.cepBuscaLoading = true;
    this.cepBuscaErro = null;

    try {
      const data = await this.fetchCepData(cep);
      if (data.erro) {
        this.setCepError('CEP não encontrado');
      } else {
        this.updateEnderecoFromCep(data);
      }
    } catch {
      this.setCepError('Erro ao buscar CEP');
    } finally {
      this.cepBuscaLoading = false;
    }
  }

  private extractCepFromForm(): string {
    return this.form.get('endereco.cep')?.value.replace(/\D/g, '') || '';
  }

  private isValidCep(cep: string): boolean {
    return cep.length === 8;
  }

  private setCepError(message: string): void {
    this.cepBuscaErro = message;
  }

  private async fetchCepData(cep: string): Promise<any> {
    const resp = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    return await resp.json();
  }

  private updateEnderecoFromCep(data: any): void {
    this.form.patchValue({
      endereco: {
        logradouro: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        estado: data.uf || ''
      }
    });
  }

  async onSubmit() {
    if (this.form.invalid) return;
    
    this.loading = true;
    this.error = null;
    
    try {
      const pessoaData = this.buildPessoaData();
      
      if (this.editMode && this.pessoaId) {
        await this.pessoasService.update(this.pessoaId, pessoaData);
        this.notificationService.showSuccess('Pessoa idosa atualizada com sucesso!');
      } else {
        await this.pessoasService.create(pessoaData);
        this.notificationService.showSuccess('Pessoa idosa cadastrada com sucesso!');
      }
      
      this.router.navigate(['/pessoa-idosa']);
    } catch (error) {
      this.error = 'Erro ao salvar pessoa idosa.';
      console.error('Erro ao salvar pessoa:', error);
    } finally {
      this.loading = false;
    }
  }

  private buildPessoaData(): PessoaIdosa {
    const v = this.form.value as any;
    
    return {
      id: this.pessoaId || '',
      dataCadastro: new Date(),
      nome: v.nome,
      dataNascimento: v.dataNascimento ? new Date(v.dataNascimento) : new Date(),
      ativo: true,
      estadoCivil: v.estadoCivil,
      cpf: v.cpf,
      rg: v.rg,
      orgaoEmissor: v.orgaoEmissor,
      religiao: v.religiao,
      naturalidade: v.naturalidade,
      telefone: v.telefone,
      prontuarioSaude: v.prontuarioSaude,
      aposentadoConsegueSeManterComSuaRenda: !!v.aposentadoConsegueSeManterComSuaRenda,
      comoComplementa: v.comoComplementa || '',
      beneficio: v.beneficio || '',
      observacao: v.observacao || '',
      historicoFamiliarSocial: v.historicoFamiliarSocial || '',
      composicaoFamiliar: this.buildComposicaoFamiliar(v),
      endereco: this.buildEndereco(v.endereco),
      dependentes: this.dependentes,
      anexos: this.anexos
    };
  }

  private buildComposicaoFamiliar(v: any) {
    return {
      alfabetizado: !!v.alfabetizado,
      estudaAtualmente: !!v.estudaAtualmente,
      nivelSerieAtualConcluido: v.nivelSerieAtualConcluido || '',
      cursosTecnicoFormacaoProfissional: v.cursosTecnicoFormacaoProfissional || '',
      situacaoOcupacional: v.situacaoOcupacional || '',
      renda: v.renda || '',
      aposentado: v.aposentado || '',
      beneficio: v.beneficio || '',
      deficiencia: v.deficiencia || '',
      problemaDeSaude: v.problemaDeSaude || '',
      fazAlgumTratamento: !!v.fazAlgumTratamento,
      fazAlgumTratamentoOnde: v.fazAlgumTratamentoOnde || '',
      usaMedicamentoControlado: !!v.usaMedicamentoControlado,
      usaRecursosUbsLocal: !!v.usaRecursosUbsLocal,
      trabalhoPastoralOuSocial: v.trabalhoPastoralOuSocial || '',
      atividadeNaComunidadeSagradaFamilia: v.atividadeNaComunidadeSagradaFamilia || '',
      trabalhoVoluntario: v.trabalhoVoluntario || '',
      trabalhoVoluntarioOnde: v.trabalhoVoluntarioOnde || ''
    };
  }

  private buildEndereco(endereco: any) {
    return {
      cep: endereco?.cep || '',
      logradouro: endereco?.logradouro || '',
      numero: endereco?.numero || '',
      estado: endereco?.estado || '',
      cidade: endereco?.cidade || '',
      bairro: endereco?.bairro || '',
      moradia: endereco?.moradia || ''
    };
  }

  voltarParaLista() {
    this.router.navigate(['/pessoa-idosa']);
  }

  async onUploadAnexo(event: { tipoAnexo: number, file: File }) {
    this.anexoUploadLoading = true;
    this.anexoUploadError = null;
    try {
      const pessoaId = this.pessoaId || 'novo';
      const { url, path } = await this.anexoService.uploadAnexo(pessoaId, event.tipoAnexo, event.file);
      this.anexos = this.anexos.filter(a => a.tipoAnexo !== event.tipoAnexo);
      this.anexos.push({ tipoAnexo: event.tipoAnexo, url, path, nomeArquivo: event.file.name });
      
      if (this.anexoForm) {
        this.anexoForm.updateSelectedFile(event.tipoAnexo, event.file.name);
      }
    } catch (e: any) {
      this.anexoUploadError = e.message || 'Erro ao fazer upload.';
      if (this.anexoForm) {
        this.anexoForm.clearSelectedFile(event.tipoAnexo);
      }
    }
    this.anexoUploadLoading = false;
  }

  async onRemoverAnexo(anexo: any) {
    this.anexoUploadLoading = true;
    try {
      await this.anexoService.deleteAnexo(anexo.path);
      this.anexos = this.anexos.filter(a => a.tipoAnexo !== anexo.tipoAnexo);
      
      if (this.anexoForm) {
        this.anexoForm.clearSelectedFile(anexo.tipoAnexo);
      }
    } catch (e) {
      this.anexoUploadError = 'Erro ao remover anexo.';
    }
    this.anexoUploadLoading = false;
  }

  async onBaixarAnexo(anexo: any) {
    try {
      window.open(anexo.url, '_blank');
    } catch (e) {
      this.anexoUploadError = 'Erro ao baixar anexo.';
    }
  }
}