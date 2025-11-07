import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { MainMenuComponent } from '../../../../../shared/components/main-menu/main-menu';
import { NotificacaoService } from '../../../../../core/services/notificacao.service';
import { UsuarioFacade } from '../../../application/usuario.facade';
import { Usuario } from '../../../domain/entities/usuario.entity';
import { UsuarioListaPaginada } from '../../../domain/repositories/usuario.repository';
import { CargoUsuario } from '../../../domain/value-objects/enums';
import { CARGO_USUARIO_LISTA } from '../../../../../shared';
import { ModalComponent } from '../../../../../shared';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UsuarioListFiltros } from '../../../domain/repositories/usuario.repository';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MainMenuComponent, ModalComponent, ReactiveFormsModule],
  templateUrl: './usuario-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsuarioListComponent implements OnInit {
  private facade = inject(UsuarioFacade);
  private notificacaoService = inject(NotificacaoService);
  private fb = inject(FormBuilder);
  cargosLista = CARGO_USUARIO_LISTA;

  usuarios$!: Observable<Usuario[]>;
  paginaAtual = 1;
  quantidadePorPagina = 10;
  page?: UsuarioListaPaginada;
  mostrarModalAtivar = false;
  mostrarModalInativar = false;
  usuarioId: string = '';
  form!: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.group({
      nome: [''],
      email: [''],
      cargo: [''],
      ativo: ['']
    });
    this.buscarPaginado(1);
  }

  private montarFiltros(): UsuarioListFiltros {
    const valores = this.form.value as { nome: string; email: string; cargo: string; ativo: string };
    const filtros: UsuarioListFiltros = {};
    if (valores.nome) filtros.nome = valores.nome;
    if (valores.email) filtros.email = valores.email;
    if (valores.cargo !== '') filtros.cargo = (Number(valores.cargo) as unknown) as CargoUsuario;
    if (valores.ativo !== '') filtros.ativo = valores.ativo === '1';
    return filtros;
  }

  limparFiltros(): void {
    this.form.reset({ nome: '', email: '', cargo: '', ativo: '' });
    this.buscarPaginado(1);
  }

  async buscarPaginado(pagina: number): Promise<void> {
    this.paginaAtual = pagina;
    const filtros = this.montarFiltros();
    this.page = await this.facade.obterTodosPaginado(this.paginaAtual, this.quantidadePorPagina, filtros);
  }

  obterNomeCargo(cargoId: CargoUsuario): string {
    const cargoEncontrado = this.cargosLista.find(c => c.id === cargoId);
    return cargoEncontrado ? cargoEncontrado.label : 'Não definido';
  }

  obterInfoCargo(cargoId: CargoUsuario) {
    return this.cargosLista.find(c => c.id === cargoId);
  }

  solicitarInativar(id: string) {
    this.mostrarModalInativar = true;
    this.usuarioId = id;
  }

  async inativar(): Promise<void> {
    try {
      await this.facade.inativar(this.usuarioId);
      this.notificacaoService.mostrarSucesso('Usuário inativado com sucesso.');
      this.buscarPaginado(1);
    } catch (error) {
      this.notificacaoService.mostrarErro('Falha ao inativar o usuário.');
    }
    this.mostrarModalInativar = false;
  }

  solicitarAtivar(id: string) {
    this.mostrarModalAtivar = true;
    this.usuarioId = id;
  }

  async ativar(): Promise<void> {
    try {
      await this.facade.ativar(this.usuarioId);
      this.notificacaoService.mostrarSucesso('Usuário ativado com sucesso.');
      this.buscarPaginado(1);
    } catch (error) {
      this.notificacaoService.mostrarErro('Falha ao ativar o usuário.');
    }
    this.mostrarModalAtivar = false;
  }

  cancelarModal() {
    this.mostrarModalAtivar = false;
    this.mostrarModalInativar = false;
  }
}