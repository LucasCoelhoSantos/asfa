import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { map, Observable } from 'rxjs';
import { first } from 'rxjs/operators';

import { MainMenuComponent } from '../../../../../shared/components/main-menu/main-menu';
import { NotificacaoService } from '../../../../../core/services/notificacao.service';
import { SessaoService } from '../../../../../core/services/sessao.service';
import { UsuarioFacade } from '../../../application/usuario.facade';
import { CargoUsuario } from '../../../domain/value-objects/enums';
import { AtualizarDadosAdminProps, AtualizarPerfilProps, CriarUsuarioProps } from '../../../domain/entities/usuario.entity';
import { DominioErro } from '../../../domain/errors/usuario.errors';

@Component({
    selector: 'app-usuario-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, MainMenuComponent],
    templateUrl: './usuario-form.html'
})
export class UsuarioFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private location = inject(Location);
    private facade = inject(UsuarioFacade);
    private sessaoService = inject(SessaoService);
    private notificacaoService = inject(NotificacaoService);

    form!: FormGroup;
    eModoEdicao = false;
    eModoPerfil = false;
    usuarioId: string | null = null;
    usuarioSessao$ = this.sessaoService.usuario$;
    cargosUsuario = Object.entries(CargoUsuario).filter(([key]) => !isNaN(Number(key))).map(([key, value]) => ({ id: Number(key), nome: value as string }));
  
    ngOnInit(): void {
        this.inicializarFormulario();
        this.verificarModoEdicao();
    }

    private inicializarFormulario(): void {
        this.form = this.fb.group({
            nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
            email: ['', [Validators.required, Validators.email]],
            cargo: [CargoUsuario.Usuario, [Validators.required]],
            ativo: [true],
        });
    }

    private verificarModoEdicao(): void {
        this.route.url.subscribe(segments => {
            this.eModoPerfil = segments.some(s => s.path === 'perfil');
        });

        const id$: Observable<string | null | undefined> = this.eModoPerfil
            ? this.sessaoService.usuario$.pipe(map(u => u?.id))
            : this.route.paramMap.pipe(map(params => params.get('id')));

            id$.pipe(first()).subscribe(id => {
                if (id) {
                    this.eModoEdicao = true;
                    this.usuarioId = id;
                    this.carregarDadosUsuario(id);
                    if (this.eModoPerfil) {
                        this.form.get('cargo')?.disable();
                        this.form.get('ativo')?.disable();
                    }
                }
              });
    }

    private carregarDadosUsuario(id: string): void {
        this.facade.obterPorId(id).pipe(first()).subscribe(usuario => {
            if (usuario) {
                this.form.patchValue({
                    nome: usuario.nome,
                    email: usuario.email,
                    cargo: usuario.cargo,
                    ativo: usuario.ativo,
                });
            } else {
                this.notificacaoService.mostrarErro('Usuário não encontrado.');
                this.voltar();
            }
        });
    }

    async aoSalvar(): Promise<void> {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.notificacaoService.mostrarAviso('Por favor, preencha os campos obrigatórios.');
            return;
        }

        try {
            if (this.eModoEdicao && this.usuarioId) {
                await this.atualizarUsuario(this.usuarioId);
            } else {
                await this.criarUsuario();
            }
            this.notificacaoService.mostrarSucesso('Operação realizada com sucesso!');
            this.voltarParaLista();
        } catch (error) {
            this.handleError(error);
        }
    }

    private async criarUsuario(): Promise<void> {
        const props: CriarUsuarioProps = {
            nome: this.form.value.nome,
            email: this.form.value.email,
            cargo: Number(this.form.value.cargo) as unknown as CargoUsuario,
            ativo: this.form.value.ativo,
        };
        await this.facade.criar(props);
    }

    private async atualizarUsuario(id: string): Promise<void> {
        if (this.eModoPerfil) {
            const props: AtualizarPerfilProps = {
                nome: this.form.value.nome,
                email: this.form.value.email
            };
            await this.facade.atualizarPerfil(id, props);
        } else {
            const props: AtualizarDadosAdminProps = {
                nome: this.form.value.nome,
                email: this.form.value.email,
                cargo: Number(this.form.value.cargo) as unknown as CargoUsuario
            };
            await this.facade.atualizarUsuario(id, props);
        }
    }

    private handleError(error: unknown): void {
        if (error instanceof DominioErro) {
            this.notificacaoService.mostrarErro(error.message);
        } else if (error instanceof Error) {
            this.notificacaoService.mostrarErro(`Ocorreu um erro: ${error.message}`);
        } else {
            this.notificacaoService.mostrarErro('Ocorreu um erro inesperado. Tente novamente.');
        }
    }

    voltar(): void {
        this.location.back();
    }

    private voltarParaLista(): void {
        if (this.eModoPerfil) {
            this.router.navigate(['/']);
        } else {
            this.router.navigate(['/usuario']);
        }
    }
}