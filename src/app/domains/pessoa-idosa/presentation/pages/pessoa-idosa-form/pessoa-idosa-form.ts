import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { first } from 'rxjs/operators';
import { MainMenuComponent } from '../../../../../shared/components/main-menu/main-menu';
import { EnderecoFormComponent } from '../../../../../shared/components/endereco-form/endereco-form';
import { NotificacaoService } from '../../../../../core/services/notificacao.service';
import { PessoaIdosaFacade } from '../../../application/pessoa-idosa.facade';
import { CriarPessoaIdosaProps, AtualizarPessoaIdosaProps } from '../../../domain/entities/pessoa-idosa.entity';
import { DominioErro } from '../../../domain/errors/pessoa-idosa.errors';
import { ComposicaoFamiliar } from '../../../domain/value-objects/composicao-familiar.vo';
import { Endereco } from '../../../domain/value-objects/endereco.vo';
import { DependenteFormComponent } from "../../../../dependente/presentation/pages/dependente-form/dependente-form";
import {
  AnexoFormComponent,
  APOSENTADO_OPCOES,
  BENEFICIO_OPCOES,
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
	imports: [CommonModule, ReactiveFormsModule, RouterModule, MainMenuComponent, EnderecoFormComponent, DependenteFormComponent, AnexoFormComponent],
	templateUrl: './pessoa-idosa-form.html',
})
export class PessoaIdosaFormComponent implements OnInit {
	private fb = inject(FormBuilder);
	private router = inject(Router);
	private route = inject(ActivatedRoute);
	private location = inject(Location);
	private facade = inject(PessoaIdosaFacade);
	private notificacaoService = inject(NotificacaoService);

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

  get enderecoForm(): FormGroup {
    return this.form.get('endereco') as FormGroup;
  }

  get anexoForm(): FormGroup {
    return this.form.get('anexos') as FormGroup;
  }

  get dependenteForm(): FormGroup {
    return this.form.get('dependentes') as FormGroup;
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
      dependentes: this.fb.group({
        id: [null],
        nome: [''],
        dataNascimento: [''],
        parentesco: [''],
        ceinf: [''],
        ceinfBairro: [''],
        programaSaudePastoralCrianca: [''],
        programaSaudePastoralCriancaLocal: [''],
        status: [true],
      }),
      anexos: this.fb.group({
        nome: [''],
        categoria: [null],
      }),
		});

    this.aplicarValidadoresDependente(this.mostrarDependenteForm);
    this.aplicarValidadoresAnexo(this.mostrarAnexoForm);
	}

  private aplicarValidadoresDependente(ativo: boolean): void {
    const grp = this.dependenteForm;
    const nome = grp.get('nome');
    const dataNascimento = grp.get('dataNascimento');
    const parentesco = grp.get('parentesco');
    if (!nome || !dataNascimento || !parentesco) return;
    if (ativo) {
      nome.setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(100)]);
      dataNascimento.setValidators([Validators.required]);
      parentesco.setValidators([Validators.required]);
    } else {
      nome.clearValidators();
      dataNascimento.clearValidators();
      parentesco.clearValidators();
      grp.reset({ status: true });
    }
    nome.updateValueAndValidity();
    dataNascimento.updateValueAndValidity();
    parentesco.updateValueAndValidity();
  }

  private aplicarValidadoresAnexo(ativo: boolean): void {
    const grp = this.anexoForm;
    const nome = grp.get('nome');
    const categoria = grp.get('categoria');
    if (!nome || !categoria) return;
    if (ativo) {
      nome.setValidators([Validators.required]);
      categoria.setValidators([Validators.required]);
    } else {
      nome.clearValidators();
      categoria.clearValidators();
      grp.reset({});
    }
    nome.updateValueAndValidity();
    categoria.updateValueAndValidity();
  }

	private verificarModoEdicao(): void {
		this.pessoaIdosaId = this.route.snapshot.paramMap.get('id');
		if (this.pessoaIdosaId) {
      this.isEditMode = true;
      this.carregarDados(this.pessoaIdosaId);
		}
	}

	private carregarDados(id: string): void {
		this.facade.obterPorId(id).pipe(first()).subscribe(pessoa => {
      if (pessoa) {
        this.form.patchValue({
        ...pessoa,
        endereco: pessoa.endereco.toJSON(),
        });
      } else {
        this.notificacaoService.mostrarErro('Registro não encontrado.');
        this.voltar();
      }
		});
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
			dependentes: [],
			anexos: [],
		};
		await this.facade.criar(props);
	}

	private async atualizar(): Promise<void> {
		const props: AtualizarPessoaIdosaProps = {
			...this.form.value,
			endereco: Endereco.criar(this.form.get('endereco')!.value),
			composicaoFamiliar: ComposicaoFamiliar.criar({
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
			dependentes: [],
			anexos: [],
		};
		await this.facade.atualizar(this.pessoaIdosaId!, props);
	}

	adicionarDependente(): void {
    this.mostrarDependenteForm = !this.mostrarDependenteForm;
    this.aplicarValidadoresDependente(this.mostrarDependenteForm);
	}

	adicionarAnexo(): void {
    this.mostrarAnexoForm = !this.mostrarAnexoForm;
    this.aplicarValidadoresAnexo(this.mostrarAnexoForm);
	}

	voltar(): void {
		this.location.back();
	}
}