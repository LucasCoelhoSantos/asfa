import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Inicializa o formulário reativo
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /**
   * Realiza o login ao submeter o formulário
   */
  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = null;
    const { email, password } = this.form.value;
    this.authService.login(email, password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = this.getErrorMessage(err);
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  /**
   * Traduz erros comuns de autenticação para mensagens amigáveis
   */
  getErrorMessage(error: any): string {
    if (error?.code === 'auth/user-not-found' || error?.code === 'auth/wrong-password') {
      return 'E-mail ou senha inválidos.';
    }
    if (error?.code === 'auth/too-many-requests') {
      return 'Muitas tentativas. Tente novamente mais tarde.';
    }
    return 'Erro ao fazer login. Tente novamente.';
  }
}