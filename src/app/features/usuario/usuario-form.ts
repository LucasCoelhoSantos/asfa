import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UsuarioService } from '../../core/services/usuario.service';
import { MainMenuComponent } from '../../shared/main-menu/main-menu';
import { UsuarioRole } from '../../models/usuario.model';
import { Router, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ROLES_USUARIO } from '../../shared/constants/app.constants';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MainMenuComponent],
  templateUrl: './usuario-form.html',
  styleUrls: ['./usuario-form.scss']
})
export class UsuarioFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form: FormGroup;
  loading = false;
  error: string | null = null;
  editMode = false;
  usuarioId: string | null = null;
  roles = ROLES_USUARIO;
  showPassword = false;

  constructor() {
    this.form = this.fb.group({
      nome: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', []], // required only on create
      role: ['', [Validators.required]],
      ativo: [true]
    });
  }

  async ngOnInit() {
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

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = null;
    const { nome, email, senha, role, ativo } = this.form.value;
    try {
      if (this.editMode && this.usuarioId) {
        await this.usuarioService.update(this.usuarioId, { nome, email, role, ativo });
      } else {
        await this.usuarioService.create({ nome, email, role, ativo: true }, senha);
      }
      this.router.navigate(['/usuario']);
    } catch (e) {
      this.error = 'Erro ao salvar.';
    }
    this.loading = false;
  }

  voltarParaLista() {
    this.router.navigate(['/usuario']);
  }
}