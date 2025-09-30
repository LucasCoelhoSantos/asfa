import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AutenticacaoService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html'
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private autenticacaoService: AutenticacaoService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  aoEnviar() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = null;
    const { email, senha } = this.form.value;
    this.autenticacaoService.entrar(email, senha).subscribe({
      next: () => {
        this.router.navigate(['/pessoa-idosa']);
      },
      error: (err) => {
        this.error = this.obterMensagemDeErro(err);
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  obterMensagemDeErro(error: any): string {
    if (error?.code === 'auth/user-not-found' || error?.code === 'auth/wrong-password' || error?.code === 'auth/invalid-credential' || error?.code === 'auth/invalid-email') {
      return 'E-mail ou senha inválidos.';
    }
    if (error?.code === 'auth/too-many-requests') {
      return 'Muitas tentativas. Tente novamente mais tarde.';
    }
    return 'Erro ao fazer login. Tente novamente.';
  }

  irParaInicio() {
    this.router.navigate(['/']);
  }
}