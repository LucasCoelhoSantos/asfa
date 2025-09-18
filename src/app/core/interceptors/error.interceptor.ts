import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificacaoService } from '../services/notificacao.service';

const ERROR_MESSAGES: Record<number, string> = {
  400: 'Dados inválidos. Verifique as informações.',
  401: 'Não autorizado. Faça login novamente.',
  403: 'Acesso negado. Sem permissão para esta operação.',
  404: 'Recurso não encontrado.',
  409: 'Conflito de dados. Verifique as informações.',
  422: 'Dados inválidos. Verifique o formulário.',
  429: 'Muitas tentativas. Tente novamente mais tarde.',
  500: 'Erro interno do servidor. Tente novamente.',
  503: 'Serviço temporariamente indisponível.'
};

export const ErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const notificacao = inject(NotificacaoService);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      const mensagemDeErro = error.error instanceof ErrorEvent
        ? `Erro: ${error.error.message}`
        : (ERROR_MESSAGES[error.status] || `Erro ${error.status}: ${error.message}`);
      
      notificacao.mostrarErro(mensagemDeErro);
      (error as any).friendlyMessage = mensagemDeErro;
      return throwError(() => error);
    })
  );
};