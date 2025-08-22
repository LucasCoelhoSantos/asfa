import { Component, inject, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PessoaIdosaService } from './pessoa-idosa.service';
import { MainMenuComponent } from '../../shared/main-menu/main-menu';
import { PessoaIdosa, Dependente } from '../../models/pessoa-idosa.model';
import { firstValueFrom } from 'rxjs';
import { DependenteFormComponent } from '../../features/dependente/dependente-form';
import { ModalComponent } from '../../shared/modal/modal';
import { AnexoService } from './anexo.service';
import { EnderecoFormComponent } from './endereco-form';
import { AnexoFormComponent } from './anexo-form';
import { NotificationService } from '../../core/services/notification.service';
import { cpfValidator, rgValidator, cepValidator, telefoneValidator, dataNascimentoValidator } from './validators.util';

const TIPOS_ANEXO = [
  { tipo: 1, label: 'CPF' },
  { tipo: 2, label: 'RG' },
  { tipo: 3, label: 'Comprovante Endereço' },
  { tipo: 4, label: 'Foto Cartão SUS' },
  { tipo: 5, label: 'Cadastro NIS' },
  { tipo: 6, label: 'Termo Autorização' },
];

const ESTADOS_CIVIS = [
  'Solteiro(a)',
  'Casado(a)',
  'Divorciado(a)',
  'Viúvo(a)'
];

const MORADIAS = [
  'Própria',
  'Alugada',
  'Cedida',
  'Financiada',
  /*
  'Casa',
  'Apartamento',
  'Sobrado',
  'Chácara',
  'Fazenda',
  */
];

@Component({
  selector: 'app-pessoas-idosas-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MainMenuComponent, DependenteFormComponent, ModalComponent, EnderecoFormComponent, AnexoFormComponent],
  templateUrl: './pessoa-idosa-form.html',
  styleUrls: ['./pessoa-idosa-form.scss'],
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

  // Dependentes
  dependentes: Dependente[] = [];
  showDependenteForm = false;
  dependenteEditIndex: number | undefined = undefined;
  dependenteEditValue: Dependente | undefined = undefined;
  showRemoveModal = false;
  dependenteToRemoveIndex: number | null = null;

  // Anexos
  anexos: any[] = [];
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
      dataNascimento: ['', [Validators.required, dataNascimentoValidator]],
      estadoCivil: ['', [Validators.required]],
      cpf: ['', [Validators.required, cpfValidator]],
      rg: ['', [rgValidator]],
      telefone: ['', [Validators.required, telefoneValidator]],
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
  }

  ngOnInit() {
    this.pessoaId = this.route.snapshot.paramMap.get('id');
    this.editMode = !!this.pessoaId;
    
    if (this.editMode && this.pessoaId) {
      this.carregarPessoa();
    }
  }

  // Métodos para aplicar máscaras automáticas
  aplicarMascaraCpf(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remove tudo que não é dígito
    
    // Aplica máscara do CPF: 000.000.000-00
    if (value.length <= 3) {
      value = value;
    } else if (value.length <= 6) {
      value = value.substring(0, 3) + '.' + value.substring(3);
    } else if (value.length <= 9) {
      value = value.substring(0, 3) + '.' + value.substring(3, 6) + '.' + value.substring(6);
    } else {
      value = value.substring(0, 3) + '.' + value.substring(3, 6) + '.' + value.substring(6, 9) + '-' + value.substring(9, 11);
    }
    
    input.value = value;
  }

  aplicarMascaraRg(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remove tudo que não é dígito
    
    // Aplica máscara do RG: 00.000.000-0
    if (value.length <= 2) {
      value = value;
    } else if (value.length <= 5) {
      value = value.substring(0, 2) + '.' + value.substring(2);
    } else if (value.length <= 8) {
      value = value.substring(0, 2) + '.' + value.substring(2, 5) + '.' + value.substring(5);
    } else {
      value = value.substring(0, 2) + '.' + value.substring(2, 5) + '.' + value.substring(5, 8) + '-' + value.substring(8, 9);
    }
    
    input.value = value;
  }

  aplicarMascaraTelefone(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remove tudo que não é dígito
    
    // Aplica máscara do telefone: (00) 00000-0000
    if (value.length <= 2) {
      value = '(' + value;
    } else if (value.length <= 6) {
      value = '(' + value.substring(0, 2) + ') ' + value.substring(2);
    } else if (value.length <= 10) {
      value = '(' + value.substring(0, 2) + ') ' + value.substring(2, 7) + '-' + value.substring(7);
    } else {
      value = '(' + value.substring(0, 2) + ') ' + value.substring(2, 7) + '-' + value.substring(7, 11);
    }
    
    input.value = value;
  }

  async carregarPessoa() {
    if (!this.pessoaId) return;
    
    this.loading = true;
    try {
      const pessoa = await firstValueFrom(this.pessoasService.getById(this.pessoaId));
      if (pessoa) {
        this.form.patchValue(pessoa);
        this.dependentes = pessoa.dependentes || [];
        this.anexos = pessoa.anexos || [];
      }
    } catch (error) {
      this.error = 'Erro ao carregar dados da pessoa.';
      console.error('Erro ao carregar pessoa:', error);
    } finally {
      this.loading = false;
    }
  }

  onEnderecoChange(endereco: any) {
    // Atualiza o endereço no formulário principal
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
      // Editando dependente existente
      this.dependentes[this.dependenteEditIndex] = dependente;
    } else {
      // Adicionando novo dependente
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

  // Anexos
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
    if (this.form.invalid) return;
    
    this.loading = true;
    this.error = null;
    
    try {
      const formValue = this.form.value;
      const pessoaData: PessoaIdosa = {
        ...formValue,
        dependentes: this.dependentes,
        anexos: this.anexos
      };
      
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

  voltarParaLista() {
    this.router.navigate(['/pessoa-idosa']);
  }

  // Métodos para integração dos componentes filhos
  async onUploadAnexo(event: { tipoAnexo: number, file: File }) {
    this.anexoUploadLoading = true;
    this.anexoUploadError = null;
    try {
      const pessoaId = this.pessoaId || 'novo';
      const { url, path } = await this.anexoService.uploadAnexo(pessoaId, event.tipoAnexo, event.file);
      // Remove anexo antigo desse tipo, se houver
      this.anexos = this.anexos.filter(a => a.tipoAnexo !== event.tipoAnexo);
      this.anexos.push({ tipoAnexo: event.tipoAnexo, url, path, nomeArquivo: event.file.name }); // Added nomeArquivo
      
      // Atualizar o estado local do componente filho
      if (this.anexoForm) {
        this.anexoForm.updateSelectedFile(event.tipoAnexo, event.file.name);
      }
    } catch (e: any) {
      this.anexoUploadError = e.message || 'Erro ao fazer upload.';
      // Limpar o estado local em caso de erro
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
      
      // Limpar o estado local do componente filho
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