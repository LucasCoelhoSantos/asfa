import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { environment } from '../environments/environment';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { PESSOA_IDOSA_REPOSITORY } from './modules/pessoa-idosa/domain/repositories/pessoa-idosa.repository';
import { PessoaIdosaFirestoreRepository } from './modules/pessoa-idosa/infrastructure/repositories/pessoa-idosa.firestore.repository';
import { 
  ListarPessoasIdosasUseCase,
  ObterPessoaIdosaPorIdUseCase,
  CriarPessoaIdosaUseCase,
  AtualizarPessoaIdosaUseCase,
  AtivarPessoaIdosaUseCase,
  InativarPessoaIdosaUseCase,
  PaginarPessoasIdosasUseCase
} from './modules/pessoa-idosa/application/use-cases';
import { USUARIO_REPOSITORY } from './modules/usuario/domain/repositories/usuario.repository';
import { UsuarioFirebaseRepository } from './modules/usuario/infrastructure/repositories/usuario.firebase.repository';
import { STORAGE_PORT } from './shared/components/anexo-form/storage.port';
import { FirebaseStorageAdapter } from './infrastructure/storage/firebase-storage.adapter';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withFetch(), withInterceptors([ErrorInterceptor])),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideFunctions(() => getFunctions()),
    provideStorage(() => getStorage()),
    { provide: PESSOA_IDOSA_REPOSITORY, useClass: PessoaIdosaFirestoreRepository },
    { provide: USUARIO_REPOSITORY, useClass: UsuarioFirebaseRepository },
    { provide: STORAGE_PORT, useClass: FirebaseStorageAdapter },
    ListarPessoasIdosasUseCase,
    ObterPessoaIdosaPorIdUseCase,
    CriarPessoaIdosaUseCase,
    AtualizarPessoaIdosaUseCase,
    AtivarPessoaIdosaUseCase,
    InativarPessoaIdosaUseCase,
    PaginarPessoasIdosasUseCase,
  ]
};