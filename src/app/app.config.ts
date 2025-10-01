import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { getStorage, provideStorage } from '@angular/fire/storage';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { AUTH_PORT } from './core/ports/auth.port';
import { AuthFirebaseAdapter } from './infrastructure/auth/auth.firebase.adapter';
import { PESSOA_IDOSA_REPOSITORY } from './domains/pessoa-idosa/domain/repositories/pessoa-idosa.repository';
import { PessoaIdosaFirestoreRepository } from './infrastructure/repositories/pessoa-idosa.firestore.repository'; 
import { USUARIO_REPOSITORY } from './domains/usuario/domain/repositories/usuario.repository';
import { UsuarioFirebaseRepository } from './infrastructure/repositories/usuario.firebase.repository'; 
import { STORAGE_PORT } from './shared/ports/storage.port';
import { FirebaseStorageAdapter } from './infrastructure/storage/firebase-storage.adapter';

import {
  ListarPessoasIdosasUseCase,
  ObterPessoaIdosaPorIdUseCase,
  CriarPessoaIdosaUseCase,
  AtualizarPessoaIdosaUseCase,
  AtivarPessoaIdosaUseCase,
  InativarPessoaIdosaUseCase,
  PaginarPessoasIdosasUseCase
} from './domains/pessoa-idosa/application/use-cases';
import {
  AtivarUsuarioUseCase,
  AtualizarPerfilUseCase,
  AtualizarUsuarioUseCase,
  CriarUsuarioUseCase,
  InativarUsuarioUseCase,
  ListarUsuariosUseCase,
  ObterUsuarioPorIdUseCase
} from './domains/usuario/application/use-cases/usuario.use-cases';
import { CEP_PORT } from './shared/ports/cep.port';
import { ViaCepAdapter } from './infrastructure/http/via-cep.adapter';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withFetch(), withInterceptors([ErrorInterceptor])),
    
    // Configuração do Firebase
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideFunctions(() => getFunctions()),
    provideStorage(() => getStorage()),

    // Provedores de Adapters para Ports da Aplicação
    { provide: AUTH_PORT, useClass: AuthFirebaseAdapter },
    { provide: PESSOA_IDOSA_REPOSITORY, useClass: PessoaIdosaFirestoreRepository },
    { provide: USUARIO_REPOSITORY, useClass: UsuarioFirebaseRepository },
    { provide: STORAGE_PORT, useClass: FirebaseStorageAdapter },
    { provide: CEP_PORT, useClass: ViaCepAdapter },
    
    // Provedores dos Casos de Uso - Usuario
    ListarUsuariosUseCase,
    ObterUsuarioPorIdUseCase,
    CriarUsuarioUseCase,
    AtualizarUsuarioUseCase,
    AtualizarPerfilUseCase,
    AtivarUsuarioUseCase,
    InativarUsuarioUseCase,

    // Provedores dos Casos de Uso - Pessoa Idosa
    ListarPessoasIdosasUseCase,
    ObterPessoaIdosaPorIdUseCase,
    CriarPessoaIdosaUseCase,
    AtualizarPessoaIdosaUseCase,
    AtivarPessoaIdosaUseCase,
    InativarPessoaIdosaUseCase,
    PaginarPessoasIdosasUseCase,
  ]
};