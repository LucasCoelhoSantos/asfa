import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AutenticacaoService } from '../../core/services/autenticacao.service';
import { NotificacaoService } from '../../core/services/notificacao.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private autenticacaoService = inject(AutenticacaoService);
  private router = inject(Router);
  private notificacaoService = inject(NotificacaoService);

  form: FormGroup;
  loading = false;

  constructor() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  aoEnviar(): void {
    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    const { email, senha } = this.form.value;

    this.autenticacaoService.entrar({ email, senha }).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: () => {
        this.router.navigate(['/pessoa-idosa']);
      },
      error: (erro) => {
        this.notificacaoService.mostrarErro(this.obterMensagemDeErro(erro));
      },
    });
  }

  obterMensagemDeErro(erro: any): string {
    switch (erro?.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
      case 'auth/invalid-email':
        return 'E-mail ou senha inválidos.';

      case 'auth/too-many-requests':
        return 'Muitas tentativas. Tente novamente mais tarde.';
        
      default:
        return 'Erro ao fazer login. Tente novamente.';
    }
  }

  irParaInicio() {
    this.router.navigate(['/']);
  }
}