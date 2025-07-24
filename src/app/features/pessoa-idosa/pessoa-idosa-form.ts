import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PessoaIdosaService } from './pessoa-idosa.service';
import { MainMenuComponent } from '../../shared/main-menu/main-menu';
import { PessoaIdosa, Dependente, Anexo } from '../../models/pessoa-idosa.model';
import { firstValueFrom } from 'rxjs';
import { DependenteFormComponent } from '../../features/dependente/dependente-form';
import { ModalComponent } from '../../shared/modal/modal';
import { AnexoService } from './anexo.service';

const TIPOS_ANEXO = [
  { tipo: 1, label: 'CPF' },
  { tipo: 2, label: 'RG' },
  { tipo: 3, label: 'Comprovante Endereço' },
  { tipo: 4, label: 'Foto Cartão SUS' },
  { tipo: 5, label: 'Cadastro NIS' },
  { tipo: 6, label: 'Termo Autorização' },
];

const ESTADOS_CIVIS = [
  'Solteiro',
  'Casado',
  'Viúvo',
  'Divorciado'
];

const MORADIAS = [
  'Casa',
  'Apartamento',
  'Sobrado',
  'Chácara',
  'Fazenda',
];

@Component({
  selector: 'app-pessoas-idosas-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MainMenuComponent, DependenteFormComponent, ModalComponent],
  templateUrl: './pessoa-idosa-form.html',
  styleUrls: ['./pessoa-idosa-form.scss']
})
export class PessoaIdosaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private pessoasService = inject(PessoaIdosaService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  form: FormGroup;
  loading = false;
  error: string | null = null;
  editMode = false;
  pessoaId: string | null = null;

  // Dependentes
  dependentes: Dependente[] = [];
  showDependenteForm = false;
  dependenteEditIndex: number | undefined = undefined;
  dependenteEditValue: Dependente | undefined = undefined;
  showRemoveModal = false;
  dependenteToRemoveIndex: number | null = null;

  // Anexos
  anexos: Anexo[] = [];
  tiposAnexo = TIPOS_ANEXO;
  anexoSelecionadoTipo: number | null = null;
  anexoSelecionadoFile: File | null = null;
  anexoUploadLoading = false;
  anexoUploadError: string | null = null;
  anexoRemoverTipo: number | null = null;
  showRemoveAnexoModal = false;

  private anexoService = inject(AnexoService);

  estadosCivis = ESTADOS_CIVIS;
  moradias = MORADIAS;
  cepBuscaLoading = false;
  cepBuscaErro: string | null = null;

  constructor() {
    this.form = this.fb.group({
      nome: ['', [Validators.required]],
      dataNascimento: ['', [Validators.required, this.dataNascimentoValidator]],
      estadoCivil: ['', [Validators.required]],
      cpf: ['', [Validators.required, this.cpfValidator]],
      rg: ['', [Validators.required, this.rgValidator]],
      telefone: ['', [Validators.required, this.telefoneValidator]],
      // ativo removido do formulário
      endereco: this.fb.group({
        cep: ['', [Validators.required, this.cepValidator]],
        logradouro: [''],
        numero: [''],
        estado: [''],
        cidade: [''],
        bairro: [''],
        moradia: ['']
      })
    });
  }

  async ngOnInit() {
    this.pessoaId = this.route.snapshot.paramMap.get('id');
    this.editMode = !!this.pessoaId;
    if (this.editMode && this.pessoaId) {
      this.loading = true;
      try {
        const pessoa = await firstValueFrom(this.pessoasService.getById(this.pessoaId));
        if (pessoa) {
          this.form.patchValue({ ...pessoa });
          this.dependentes = pessoa.dependentes || [];
          this.anexos = pessoa.anexos || [];
        }
      } catch (e) {
        this.error = 'Erro ao carregar dados.';
      }
      this.loading = false;
    }
  }

  // Dependentes
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

  salvarDependente(dep: Dependente) {
    if (this.dependenteEditIndex !== undefined) {
      this.dependentes[this.dependenteEditIndex] = dep;
    } else {
      this.dependentes.push(dep);
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
    this.showRemoveModal = true;
    this.dependenteToRemoveIndex = index;
  }

  removerDependenteConfirmado() {
    if (this.dependenteToRemoveIndex !== null) {
      this.dependentes.splice(this.dependenteToRemoveIndex, 1);
    }
    this.showRemoveModal = false;
    this.dependenteToRemoveIndex = null;
  }

  cancelarRemoverDependente() {
    this.showRemoveModal = false;
    this.dependenteToRemoveIndex = null;
  }

  // Anexos
  getAnexoPorTipo(tipo: number): Anexo | undefined {
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
      const { url, path } = await this.anexoService.uploadAnexo(pessoaId, this.anexoSelecionadoFile);
      // Remove anexo antigo desse tipo, se houver
      this.anexos = this.anexos.filter(a => a.tipoAnexo !== tipo);
      this.anexos.push({ tipoAnexo: tipo, url, path });
      this.anexoSelecionadoFile = null;
      this.anexoSelecionadoTipo = null;
    } catch (e: any) {
      this.anexoUploadError = e.message || 'Erro ao fazer upload.';
    }
    this.anexoUploadLoading = false;
  }

  baixarAnexo(anexo: Anexo) {
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

  // Validações customizadas
  cpfValidator(control: any) {
    const value = (control.value || '').replace(/\D/g, '');
    if (!value || value.length !== 11) return { cpf: true };
    // Validação de CPF (simplificada)
    let sum = 0;
    let rest;
    if (value === "00000000000") return { cpf: true };
    for (let i = 1; i <= 9; i++) sum = sum + parseInt(value.substring(i - 1, i)) * (11 - i);
    rest = (sum * 10) % 11;
    if ((rest === 10) || (rest === 11)) rest = 0;
    if (rest !== parseInt(value.substring(9, 10))) return { cpf: true };
    sum = 0;
    for (let i = 1; i <= 10; i++) sum = sum + parseInt(value.substring(i - 1, i)) * (12 - i);
    rest = (sum * 10) % 11;
    if ((rest === 10) || (rest === 11)) rest = 0;
    if (rest !== parseInt(value.substring(10, 11))) return { cpf: true };
    return null;
  }

  rgValidator(control: any) {
    const value = (control.value || '').replace(/\D/g, '');
    if (!value || value.length < 5) return { rg: true };
    return null;
  }

  cepValidator(control: any) {
    const value = (control.value || '').replace(/\D/g, '');
    if (!value || value.length !== 8) return { cep: true };
    return null;
  }

  telefoneValidator(control: any) {
    const value = (control.value || '').replace(/\D/g, '');
    if (!value || (value.length !== 10 && value.length !== 11)) return { telefone: true };
    return null;
  }

  dataNascimentoValidator(control: any) {
    const value = control.value;
    if (!value) return { dataNascimento: true };
    const data = new Date(value);
    const hoje = new Date();
    if (data > hoje) return { dataNascimento: true };
    return null;
  }

  // Busca CEP no ViaCEP
  async buscarCep() {
    this.cepBuscaLoading = true;
    this.cepBuscaErro = null;
    const cep = this.form.get('endereco.cep')?.value.replace(/\D/g, '');
    if (!cep || cep.length !== 8) {
      this.cepBuscaErro = 'CEP inválido';
      this.cepBuscaLoading = false;
      return;
    }
    try {
      const resp = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await resp.json();
      if (data.erro) {
        this.cepBuscaErro = 'CEP não encontrado';
      } else {
        this.form.patchValue({
          endereco: {
            logradouro: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
            estado: data.uf || ''
          }
        });
      }
    } catch {
      this.cepBuscaErro = 'Erro ao buscar CEP';
    }
    this.cepBuscaLoading = false;
  }

  async onSubmit() {
    //if (this.form.invalid) return;
    this.loading = true;
    this.error = null;
    const pessoa: PessoaIdosa = {
      ...this.form.value,
      dataCadastro: this.editMode ? undefined : new Date(),
      dependentes: this.dependentes,
      anexos: this.anexos,
      composicaoFamiliar: {} as any,
      ativo: true // sempre true na criação
    };
    try {
      if (this.editMode && this.pessoaId) {
        await this.pessoasService.update(this.pessoaId, pessoa);
      } else {
        await this.pessoasService.create(pessoa);
      }
      this.router.navigate(['/pessoa-idosa']);
    } catch (e) {
      this.error = 'Erro ao salvar.';
    }
    this.loading = false;
  }

  public voltarParaLista() {
    this.router.navigate(['/pessoa-idosa']);
  }
}