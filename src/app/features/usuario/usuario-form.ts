import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UsuarioService } from '../../core/services/usuario.service';
import { AuthService } from '../../core/services/auth.service';
import { MainMenuComponent } from '../../shared/components/main-menu/main-menu';
import { Router, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ROLES_USUARIO_OPTIONS } from '../../shared/constants/app.constants';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MainMenuComponent],
  templateUrl: './usuario-form.html'
})
export class UsuarioFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form: FormGroup;
  loading = false;
  error: string | null = null;
  editMode = false;
  isProfileMode = false;
  usuarioId: string | null = null;
  roles = ROLES_USUARIO_OPTIONS;
  showPassword = false;

  constructor() {
    this.form = this.fb.group({
      nome: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', []],
      role: ['', [Validators.required]],
      ativo: [true]
    });
  }

  async ngOnInit() {
    this.isProfileMode = this.route.snapshot.url[0]?.path === 'perfil';
    
    if (this.isProfileMode) {
      this.editMode = true;
      this.loading = true;
      try {
        const user = await firstValueFrom(this.authService.userWithRole$);
        if (user && 'nome' in user && 'email' in user) {
          this.form.patchValue({
            nome: user.nome,
            email: user.email,
            senha: ''
          });
        }
        this.form.get('senha')?.clearValidators();
        this.form.get('senha')?.updateValueAndValidity();
      } catch (e) {
        this.error = 'Erro ao carregar dados do usuário.';
      }
      this.loading = false;
    } else {
      this.usuarioId = this.route.snapshot.paramMap.get('id');
      this.editMode = !!this.usuarioId;
      
      if (this.editMode && this.usuarioId) {
        this.loading = true;
        try {
          const usuario = await firstValueFrom(this.usuarioService.getById(this.usuarioId));
          if (usuario) {
            this.form.patchValue({ ...usuario, senha: '' });
          }
          this.form.get('senha')?.clearValidators();
          this.form.get('senha')?.updateValueAndValidity();
        } catch (e) {
          this.error = 'Erro ao carregar dados.';
        }
        this.loading = false;
      } else {
        this.form.get('senha')?.setValidators([Validators.required, Validators.minLength(6)]);
        this.form.get('senha')?.updateValueAndValidity();
      }
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = null;
    const { nome, email, senha, role, ativo } = this.form.value;
    
    try {
      if (this.isProfileMode) {
        const updateData: any = { nome, email };
        if (senha && senha.trim()) {
          updateData.senha = senha;
        }
        await this.usuarioService.updateSelf(updateData);
        this.router.navigate(['/pessoa-idosa']);
      } else if (this.editMode && this.usuarioId) {
        await this.usuarioService.update(this.usuarioId, { nome, email, role, ativo });
        this.router.navigate(['/usuario']);
      } else {
        await this.usuarioService.create({ nome, email, role, ativo: true }, senha);
        this.router.navigate(['/usuario']);
      }
    } catch (e) {
      this.error = 'Erro ao salvar.';
    }
    this.loading = false;
  }

  voltarParaLista() {
    if (this.isProfileMode) {
      this.router.navigate(['/pessoa-idosa']);
    } else {
      this.router.navigate(['/usuario']);
    }
  }
}