import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UsuarioService } from '../../../../../core/services/usuario.service';
import { AutenticacaoService } from '../../../../../core/services/auth.service';
import { MainMenuComponent } from '../../../../../shared/components/main-menu/main-menu';
import { Router, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CargoUsuario } from '../../../domain/value-objects/enums';
import { CARGOS_USUARIO_OPCOES } from '../../../../../shared/constants/app.constants';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MainMenuComponent],
  templateUrl: './usuario-form.html'
})
export class UsuarioFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private autenticacaoService = inject(AutenticacaoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form: FormGroup;
  carregando = false;
  erro: string | null = null;
  eModoEdicao = false;
  eModoPerfil = false;
  usuarioId: string | null = null;
  cargos: CargoUsuario[] = CARGOS_USUARIO_OPCOES as CargoUsuario[];
  mostrarSenha = false;

  constructor() {
    this.form = this.fb.group({
      nome: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', []],
      cargo: ['', [Validators.required]],
      ativo: [true]
    });
  }

  async ngOnInit() {
    this.eModoPerfil = this.route.snapshot.url[0]?.path === 'perfil';
    
    if (this.eModoPerfil) {
      this.eModoEdicao = true;
      this.carregando = true;
      try {
        const usuario = await firstValueFrom(this.autenticacaoService.usuarioComCargo$);
        if (usuario && 'nome' in usuario && 'email' in usuario) {
          this.form.patchValue({
            nome: usuario.nome,
            email: usuario.email,
            senha: ''
          });
        }
        this.form.get('senha')?.clearValidators();
        this.form.get('senha')?.updateValueAndValidity();
      } catch (e) {
        this.erro = 'Erro ao carregar dados do usuário.';
      }
      this.carregando = false;
    } else {
      this.usuarioId = this.route.snapshot.paramMap.get('id');
      this.eModoEdicao = !!this.usuarioId;
      
      if (this.eModoEdicao && this.usuarioId) {
        this.carregando = true;
        try {
          const usuario = await firstValueFrom(this.usuarioService.obterPorId(this.usuarioId));
          if (usuario) {
            this.form.patchValue({ ...usuario, senha: '' });
          }
          this.form.get('senha')?.clearValidators();
          this.form.get('senha')?.updateValueAndValidity();
        } catch (e) {
          this.erro = 'Erro ao carregar dados.';
        }
        this.carregando = false;
      } else {
        this.form.get('senha')?.setValidators([Validators.required, Validators.minLength(6)]);
        this.form.get('senha')?.updateValueAndValidity();
      }
    }
  }

  alternarSenha() {
    this.mostrarSenha = !this.mostrarSenha;
  }

  async aoEnviar() {
    if (this.form.invalid) return;
    this.carregando = true;
    this.erro = null;
    const { nome, email, senha, cargo, ativo } = this.form.value;
    
    try {
      if (this.eModoPerfil) {
        const dadosEditados: any = { nome, email };
        if (senha && senha.trim()) {
          dadosEditados.senha = senha;
        }
        await this.usuarioService.editarPerfil(dadosEditados);
        this.router.navigate(['/pessoa-idosa']);
      } else if (this.eModoEdicao && this.usuarioId) {
        await this.usuarioService.editar(this.usuarioId, { nome, email, cargo, ativo });
        this.router.navigate(['/usuario']);
      } else {
        await this.usuarioService.criar({ nome, email, cargo, ativo: true }, senha);
        this.router.navigate(['/usuario']);
      }
    } catch (e) {
      this.erro = 'Erro ao salvar.';
    }
    this.carregando = false;
  }

  voltarParaLista() {
    if (this.eModoPerfil) {
      this.router.navigate(['/pessoa-idosa']);
    } else {
      this.router.navigate(['/usuario']);
    }
  }
}