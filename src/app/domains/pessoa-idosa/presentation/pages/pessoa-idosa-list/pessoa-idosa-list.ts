import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MainMenuComponent } from '../../../../../shared/components/main-menu/main-menu';
import { NotificacaoService } from '../../../../../core/services/notificacao.service';
import { PessoaIdosaFacade } from '../../../application/pessoa-idosa.facade';
import { PessoaIdosaFiltros, PessoaIdosaListaPaginada } from '../../../domain/repositories/pessoa-idosa.repository';
import { CpfPipe, ModalComponent } from '../../../../../shared';
import { TelefonePipe } from '../../../../../shared';
import {
  ESTADO_CIVIL_OPCOES,
  ESCOLARIDADE_OPCOES,
  TIPO_FORMACAO_PROFISSIONAL_OPCOES,
  BENEFICIO_OPCOES,
  SITUACAO_OCUPACIONAL_OPCOES,
  PROBLEMA_DE_SAUDE_OPCOES,
  APOSENTADO_OPCOES,
  MORADIA_OPCOES,
  DEFICIENCIA_OPCOES,
} from '../../../../../shared';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PessoaIdosa } from '../../../domain/entities/pessoa-idosa.entity';

@Component({
  selector: 'app-pessoa-idosa-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MainMenuComponent, CpfPipe, TelefonePipe, ModalComponent, ReactiveFormsModule],
  templateUrl: './pessoa-idosa-list.html'
})
export class PessoaIdosaListComponent implements OnInit {
  private facade = inject(PessoaIdosaFacade);
  private notificacaoService = inject(NotificacaoService);
  private fb = inject(FormBuilder);
  
  paginaAtual = 1;
  quantidadePorPagina = 10;
  page?: PessoaIdosaListaPaginada;

  estadoCivilOpcoes = ESTADO_CIVIL_OPCOES;
  escolaridadeOpcoes = ESCOLARIDADE_OPCOES;
  cursosFormacaoOpcoes = TIPO_FORMACAO_PROFISSIONAL_OPCOES;
  beneficioOpcoes = BENEFICIO_OPCOES;
  situacaoOcupacionalOpcoes = SITUACAO_OCUPACIONAL_OPCOES;
  problemaDeSaudeOpcoes = PROBLEMA_DE_SAUDE_OPCOES;
  aposentadoOpcoes = APOSENTADO_OPCOES;
  moradiaOpcoes = MORADIA_OPCOES;
  deficienciaOpcoes = DEFICIENCIA_OPCOES;

  mostrarModalInativar = false;
  mostrarModalAtivar = false;
  pessoaIdosaId: string = '';
  form!: FormGroup;
  
  ngOnInit(): void {
    this.form = this.fb.group({
      nome: [''],
      dataNascimento: [''],
      estadoCivil: [''],
      cpf: [''],
      rg: [''],
      cep: [''],
      alfabetizado: [''],
      estudaAtualmente: [''],
      nivelSerieAtual: [''],
      cursoFormacao: [''],
      beneficio: [''],
      situacaoOcupacional: [''],
      problemaDeSaude: [''],
      aposentado: [''],
      moradia: [''],
      deficiencia: [''],
      ativo: ['']
    });
    this.buscarPaginado(1);
  }

  private montarFiltros(): PessoaIdosaFiltros {
    const v = this.form.value as any;
    const filtros: PessoaIdosaFiltros = {};
    if (v.nome) filtros.nome = v.nome;
    if (v.dataNascimento) filtros.dataNascimento = v.dataNascimento;
    if (v.estadoCivil) filtros.estadoCivil = v.estadoCivil;
    if (v.cpf) filtros.cpf = v.cpf;
    if (v.rg) filtros.rg = v.rg;
    if (v.cep) filtros.cep = v.cep;
    if (v.alfabetizado !== '') filtros.alfabetizado = !!v.alfabetizado;
    if (v.estudaAtualmente !== '') filtros.estudaAtualmente = !!v.estudaAtualmente;
    if (v.nivelSerieAtual) filtros.nivelSerieAtual = v.nivelSerieAtual;
    if (v.cursoFormacao) filtros.cursoFormacao = v.cursoFormacao;
    if (v.beneficio) filtros.beneficio = v.beneficio;
    if (v.situacaoOcupacional) filtros.situacaoOcupacional = v.situacaoOcupacional;
    if (v.problemaDeSaude) filtros.problemaDeSaude = v.problemaDeSaude;
    if (v.aposentado) filtros.aposentado = v.aposentado;
    if (v.moradia) filtros.moradia = v.moradia;
    if (v.deficiencia) filtros.deficiencia = v.deficiencia;
    if (v.ativo) filtros.ativo = v.ativo;
    return filtros;
  }

  limparFiltros(): void {
    this.form.reset({
      nome: '', dataNascimento: '', estadoCivil: '', cpf: '', rg: '', cep: '',
      alfabetizado: '', estudaAtualmente: '', nivelSerieAtual: '', beneficio: '',
      situacaoOcupacional: '', problemaDeSaude: '', aposentado: '', moradia: '',
      deficiencia: '', ativo: ''
    });
    this.buscarPaginado(1);
  }

  async buscarPaginado(pagina: number): Promise<void> {
    this.paginaAtual = pagina;
    const filtros = this.montarFiltros();
    this.page = await this.facade.obterTodosPaginado(this.paginaAtual, this.quantidadePorPagina, filtros);
  }

  exportarPdf(): void {
    if (this.page?.pessoasIdosas.length == 0) {
      this.notificacaoService.mostrarErro('Nenhuma pessoa idosa encontrada para relatório.');
      return;
    }
    this.facade.gerarRelatorioListaPdf(this.page?.pessoasIdosas as PessoaIdosa[]);
  }

  solicitarInativar(id: string) {
    this.mostrarModalInativar = true;
    this.pessoaIdosaId = id;
  }

  async inativar(): Promise<void> {
    try {
      await this.facade.inativar(this.pessoaIdosaId);
      this.notificacaoService.mostrarSucesso('Pessoa idosa inativada com sucesso.');
    this.buscarPaginado(1);
    } catch (error) {
      this.notificacaoService.mostrarErro('Falha ao inativar a pessoa idosa.');
    }
    this.mostrarModalInativar = false;
  }

  solicitarAtivar(id: string) {
    this.mostrarModalAtivar = true;
    this.pessoaIdosaId = id;
  }

  async ativar(): Promise<void> {
    try {
      await this.facade.ativar(this.pessoaIdosaId);
      this.notificacaoService.mostrarSucesso('Pessoa idosa ativado com sucesso.');
      this.buscarPaginado(1);
    } catch (error) {
      this.notificacaoService.mostrarErro('Falha ao ativar a pessoa idosa.');
    }
    this.mostrarModalAtivar = false;
  }

  cancelarModal() {
    this.mostrarModalAtivar = false;
    this.mostrarModalInativar = false;
  }
}