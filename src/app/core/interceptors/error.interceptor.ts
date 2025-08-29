import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

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
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Erro inesperado. Tente novamente.';

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Erro: ${error.error.message}`;
      } else {
        errorMessage = ERROR_MESSAGES[error.status] || `Erro ${error.status}: ${error.message}`;
      }
      
      return throwError(() => new Error(errorMessage));
    })
  );
}; 