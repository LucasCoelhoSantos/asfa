import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { first } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { MainMenuComponent } from '../../../../../shared/components/main-menu/main-menu';
import { EnderecoFormComponent } from '../../../../../shared/components/endereco-form/endereco-form';
import { NotificacaoService } from '../../../../../core/services/notificacao.service';
import { PessoaIdosaFacade } from '../../../application/pessoa-idosa.facade';
import { CriarPessoaIdosaProps, AtualizarPessoaIdosaProps } from '../../../domain/entities/pessoa-idosa.entity';
import { DominioErro } from '../../../domain/errors/pessoa-idosa.errors';
import { ComposicaoFamiliar } from '../../../domain/value-objects/composicao-familiar.vo';
import { Endereco } from '../../../domain/value-objects/endereco.vo';
import { DependenteFormComponent } from "../../../../dependente/presentation/pages/dependente-form/dependente-form";
import { DependenteProps } from '../../../../dependente/domain/entities/dependente.entity';
import { AnexoProps } from '../../../domain/value-objects/anexo.vo';
import { AnexoListComponent } from '../../../../../shared/components/anexo-list/anexo-list';

// Tipo estendido para anexos com arquivo
interface AnexoComArquivo extends AnexoProps {
  file?: File;
}
import {
  AnexoFormComponent,
  APOSENTADO_OPCOES,
  BENEFICIO_OPCOES,
  CATEGORIA_ANEXO_INFO,
  DEFICIENCIA_OPCOES,
  ESCOLARIDADE_OPCOES,
  ESTADO_CIVIL_OPCOES,
  PROBLEMA_DE_SAUDE_OPCOES,
  RENDA_OPCOES,
  SITUACAO_OCUPACIONAL_OPCOES,
  TIPO_FORMACAO_PROFISSIONAL_OPCOES
} from '../../../../../shared';

@Component({
	selector: 'app-pessoa-idosa-form',
	standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MainMenuComponent, EnderecoFormComponent, DependenteFormComponent, AnexoFormComponent, AnexoListComponent],
	templateUrl: './pessoa-idosa-form.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PessoaIdosaFormComponent implements OnInit {
	private fb = inject(FormBuilder);
	private router = inject(Router);
	private route = inject(ActivatedRoute);
	private location = inject(Location);
	private facade = inject(PessoaIdosaFacade);
	private notificacaoService = inject(NotificacaoService);

  readonly categoriasAnexoInfo = CATEGORIA_ANEXO_INFO;
	estadoCivilOpcoes = ESTADO_CIVIL_OPCOES;
	beneficioOpcoes = BENEFICIO_OPCOES;
	situacaoOcupacionalOpcoes = SITUACAO_OCUPACIONAL_OPCOES;
	aposentadoOpcoes = APOSENTADO_OPCOES;
	rendaOpcoes = RENDA_OPCOES;
	nivelSerieAtualConcluidoOpcoes = ESCOLARIDADE_OPCOES;
	cursosTecnicoFormacaoProfissionalOpcoes = TIPO_FORMACAO_PROFISSIONAL_OPCOES;
	deficienciaOpcoes = DEFICIENCIA_OPCOES;
	problemaDeSaudeOcpoes = PROBLEMA_DE_SAUDE_OPCOES;

	form!: FormGroup;
	isEditMode = false;
	pessoaIdosaId: string | null = null;

	mostrarDependenteForm = false;
	mostrarAnexoForm = false;
	
	dependentesAdicionados: DependenteProps[] = [];
	anexosAdicionados: AnexoComArquivo[] = [];
	selectedDependenteIndex: number | null = null;
	selectedDependente: DependenteProps | null = null;
  selectedAnexoIndex: number | null = null;
  selectedAnexo: AnexoComArquivo | null = null;

  get enderecoForm(): FormGroup {
    return this.form.get('endereco') as FormGroup;
  }

  get dependentesArray(): FormArray {
    return this.form.get('dependentes') as FormArray;
  }

  get anexosArray(): FormArray {
    return this.form.get('anexos') as FormArray;
  }

	ngOnInit(): void {
		this.inicializarFormulario();
		this.verificarModoEdicao();
	}

	private inicializarFormulario(): void {
		this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      dataNascimento: ['', Validators.required],
      estadoCivil: ['', Validators.required],
      cpf: ['', Validators.required],
      rg: ['', Validators.required],
      orgaoEmissor: ['', Validators.required],
      naturalidade: ['', [Validators.required]],
      telefone: ['', Validators.required],
      email: ['', [Validators.email]],
      prontuarioSaude: ['', [Validators.required]],
      religiao: ['', [Validators.required]],
      situacaoOcupacional: ['', [Validators.required]],
      aposentado: [false],
      renda: ['', [Validators.required]],
      aposentadoConsegueSeManterComSuaRenda: [false],
      comoComplementa: [''],
      beneficio: ['', [Validators.required]],
      alfabetizado: [false],
      nivelSerieAtualConcluido: ['', [Validators.required]],
      cursosTecnicoFormacaoProfissional: ['', [Validators.required]],
      estudaAtualmente: [false],
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
      historicoFamiliarSocial: [''],
      observacao: [''],
      endereco: this.fb.group({
        cep: ['', Validators.required],
        moradia: ['', Validators.required],
        logradouro: ['', Validators.required],
        numero: ['', Validators.required],
        bairro: ['', Validators.required],
        cidade: ['', Validators.required],
        estado: ['', Validators.required],
      }),
      dependentes: this.fb.array([]),
      anexos: this.fb.array([]),
		});
	}

  private async verificarModoEdicao(): Promise<void> {
    this.pessoaIdosaId = this.route.snapshot.paramMap.get('id');
    if (!this.pessoaIdosaId) return;
    this.isEditMode = true;

    const pessoa = await firstValueFrom(this.facade.obterPorId(this.pessoaIdosaId).pipe(first()));
    if (!pessoa) {
      this.notificacaoService.mostrarErro('Registro não encontrado.');
      this.voltar();
      return;
    }

    const dto = pessoa.toJSON();
    const { composicaoFamiliar, endereco, dependentes, anexos, ...resto } = dto as any;

    this.form.patchValue({
      ...resto,
      ...(composicaoFamiliar || {}),
      endereco: endereco || {}
    });

    if (dependentes && dependentes.length > 0) {
      this.dependentesAdicionados = dependentes;
      dependentes.forEach((dependente: any) => {
        this.dependentesArray.push(this.fb.group(dependente));
      });
    }

    if (anexos && anexos.length > 0) {
      this.anexosAdicionados = anexos;
      anexos.forEach((anexo: any) => {
        this.anexosArray.push(this.fb.group(anexo));
      });
    }
  }

	async aoSalvar(): Promise<void> {
		if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notificacaoService.mostrarAviso('Por favor, preencha todos os campos obrigatórios.');
      return;
		}

		try {
      if (this.isEditMode && this.pessoaIdosaId) {
        await this.atualizar();
      } else {
        await this.criar();
      }
      this.notificacaoService.mostrarSucesso('Registro salvo com sucesso!');
      this.router.navigate(['/pessoa-idosa']);
		} catch (erro) {
      if (erro instanceof DominioErro) {
        this.notificacaoService.mostrarErro(erro.message);
      } else {
        this.notificacaoService.mostrarErro('Ocorreu um erro inesperado ao salvar.');
        console.error(erro);
      }
		}
	}

	private async criar(): Promise<void> {
		const props: CriarPessoaIdosaProps = {
			...this.form.value,
			endereco: Endereco.criar(this.form.get('endereco')!.value),
			composicaoFamiliar: ComposicaoFamiliar.criar({
        estadoCivil: this.form.get('estadoCivil')!.value,
				alfabetizado: this.form.get('alfabetizado')!.value,
				estudaAtualmente: this.form.get('estudaAtualmente')!.value,
				nivelSerieAtualConcluido: this.form.get('nivelSerieAtualConcluido')!.value,
				cursosTecnicoFormacaoProfissional: this.form.get('cursosTecnicoFormacaoProfissional')!.value,
				situacaoOcupacional: this.form.get('situacaoOcupacional')!.value,
				renda: this.form.get('renda')!.value,
				aposentado: this.form.get('aposentado')!.value,
				beneficio: this.form.get('beneficio')!.value,
				deficiencia: this.form.get('deficiencia')!.value,
				problemaDeSaude: this.form.get('problemaDeSaude')!.value,
				fazAlgumTratamento: this.form.get('fazAlgumTratamento')!.value,
				fazAlgumTratamentoOnde: this.form.get('fazAlgumTratamentoOnde')!.value,
				usaMedicamentoControlado: this.form.get('usaMedicamentoControlado')!.value,
				usaRecursosUbsLocal: this.form.get('usaRecursosUbsLocal')!.value,
				trabalhoPastoralOuSocial: this.form.get('trabalhoPastoralOuSocial')!.value,
				atividadeNaComunidadeSagradaFamilia: this.form.get('atividadeNaComunidadeSagradaFamilia')!.value,
				trabalhoVoluntario: this.form.get('trabalhoVoluntario')!.value,
				trabalhoVoluntarioOnde: this.form.get('trabalhoVoluntarioOnde')!.value
			}),
			dependentes: this.dependentesAdicionados,
			anexos: this.anexosAdicionados,
		};
		await this.facade.criar(props);
	}

	private async atualizar(): Promise<void> {
		const props: AtualizarPessoaIdosaProps = {
			...this.form.value,
			endereco: Endereco.criar(this.form.get('endereco')!.value),
			composicaoFamiliar: ComposicaoFamiliar.criar({
        estadoCivil: this.form.get('estadoCivil')!.value,
				alfabetizado: this.form.get('alfabetizado')!.value,
				estudaAtualmente: this.form.get('estudaAtualmente')!.value,
				nivelSerieAtualConcluido: this.form.get('nivelSerieAtualConcluido')!.value,
				cursosTecnicoFormacaoProfissional: this.form.get('cursosTecnicoFormacaoProfissional')!.value,
				situacaoOcupacional: this.form.get('situacaoOcupacional')!.value,
				renda: this.form.get('renda')!.value,
				aposentado: this.form.get('aposentado')!.value,
				beneficio: this.form.get('beneficio')!.value,
				deficiencia: this.form.get('deficiencia')!.value,
				problemaDeSaude: this.form.get('problemaDeSaude')!.value,
				fazAlgumTratamento: this.form.get('fazAlgumTratamento')!.value,
				fazAlgumTratamentoOnde: this.form.get('fazAlgumTratamentoOnde')!.value,
				usaMedicamentoControlado: this.form.get('usaMedicamentoControlado')!.value,
				usaRecursosUbsLocal: this.form.get('usaRecursosUbsLocal')!.value,
				trabalhoPastoralOuSocial: this.form.get('trabalhoPastoralOuSocial')!.value,
				atividadeNaComunidadeSagradaFamilia: this.form.get('atividadeNaComunidadeSagradaFamilia')!.value,
				trabalhoVoluntario: this.form.get('trabalhoVoluntario')!.value,
				trabalhoVoluntarioOnde: this.form.get('trabalhoVoluntarioOnde')!.value
			}),
			dependentes: this.dependentesAdicionados,
			anexos: this.anexosAdicionados,
		};
		await this.facade.atualizar(this.pessoaIdosaId!, props);
	}

  adicionarDependente(): void {
    this.mostrarDependenteForm = !this.mostrarDependenteForm;
    this.selectedDependenteIndex = null;
    this.selectedDependente = null;
  }

	adicionarAnexo(): void {
    this.mostrarAnexoForm = !this.mostrarAnexoForm;
    this.selectedAnexoIndex = null;
    this.selectedAnexo = null;
	}

  onDependenteSalvo(dependente: DependenteProps): void {
    if (this.selectedDependenteIndex !== null) {
        this.dependentesAdicionados[this.selectedDependenteIndex] = dependente;
        this.dependentesArray.setControl(this.selectedDependenteIndex, this.fb.group(dependente));
        this.notificacaoService.mostrarSucesso('Dependente atualizado com sucesso!');
    } else {
        this.dependentesAdicionados.push(dependente);
        this.dependentesArray.push(this.fb.group(dependente));
        this.notificacaoService.mostrarSucesso('Dependente adicionado com sucesso!');
    }
    this.mostrarDependenteForm = false;
    this.selectedDependenteIndex = null;
    this.selectedDependente = null;
  }

  onDependenteCancelado(): void {
    this.mostrarDependenteForm = false;
    this.selectedDependenteIndex = null;
    this.selectedDependente = null;
  }

  editarDependente(index: number): void {
    this.selectedDependenteIndex = index;
    this.selectedDependente = this.dependentesAdicionados[index];
    this.mostrarDependenteForm = true;
  }

	onAnexoSalvo(anexo: AnexoComArquivo): void {
    if (this.selectedAnexoIndex !== null) {
      this.anexosAdicionados[this.selectedAnexoIndex] = anexo;
      this.anexosArray.setControl(this.selectedAnexoIndex, this.fb.group(anexo));
      this.notificacaoService.mostrarSucesso('Anexo atualizado com sucesso!');
    } else {
      this.anexosAdicionados.push(anexo);
      this.anexosArray.push(this.fb.group(anexo));
      this.notificacaoService.mostrarSucesso('Anexo adicionado com sucesso!');
    }
    this.mostrarAnexoForm = false;
    this.selectedAnexoIndex = null;
    this.selectedAnexo = null;
	}

	onAnexoCancelado(): void {
		this.mostrarAnexoForm = false;
    this.selectedAnexoIndex = null;
    this.selectedAnexo = null;
	}

	// Handler reservado para suportar múltiplos arquivos futuramente.
	onAnexosSelecionados(_files: File[]): void {
		// No fluxo atual, mantemos apenas o primeiro arquivo via (save)
	}

  editarAnexo(index: number): void {
    this.selectedAnexoIndex = index;
    this.selectedAnexo = this.anexosAdicionados[index];
  }

  onArquivoEditado(event: Event): void {
    if (this.selectedAnexoIndex === null || this.selectedAnexoIndex === undefined) return;
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) {
      this.notificacaoService.mostrarErro('O arquivo não pode exceder 5MB.');
      return;
    }

    const anexoAtual = this.anexosAdicionados[this.selectedAnexoIndex] as any;
    const atualizado = { ...anexoAtual, file };
    this.anexosAdicionados[this.selectedAnexoIndex] = atualizado;
    this.anexosArray.at(this.selectedAnexoIndex).patchValue({ url: anexoAtual.url ?? null, path: anexoAtual.path ?? null, categoria: anexoAtual.categoria });

    this.notificacaoService.mostrarSucesso('Arquivo atualizado. Salve o formulário para concluir.');
    this.selectedAnexoIndex = null;
    this.selectedAnexo = null;
    (event.target as HTMLInputElement).value = '';
  }

	removerDependente(index: number): void {
		this.dependentesAdicionados.splice(index, 1);
		this.dependentesArray.removeAt(index);
		this.notificacaoService.mostrarSucesso('Dependente removido!');
	}

	removerAnexo(index: number): void {
		this.anexosAdicionados.splice(index, 1);
		this.anexosArray.removeAt(index);
		this.notificacaoService.mostrarSucesso('Anexo removido!');
	}

	voltar(): void {
		this.location.back();
	}

	trackByIndex(index: number): number {
		return index;
	}
}