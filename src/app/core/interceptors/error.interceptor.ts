import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const ErrorInterceptor: HttpInterceptorFn = (request, next) => {
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Erro inesperado. Tente novamente.';

      if (error.error instanceof ErrorEvent) {
        // Erro do cliente
        errorMessage = `Erro: ${error.error.message}`;
      } else {
        // Erro do servidor
        switch (error.status) {
          case 400:
            errorMessage = 'Dados inválidos. Verifique as informações.';
            break;
          case 401:
            errorMessage = 'Não autorizado. Faça login novamente.';
            break;
          case 403:
            errorMessage = 'Acesso negado. Sem permissão para esta operação.';
            break;
          case 404:
            errorMessage = 'Recurso não encontrado.';
            break;
          case 409:
            errorMessage = 'Conflito de dados. Verifique as informações.';
            break;
          case 422:
            errorMessage = 'Dados inválidos. Verifique o formulário.';
            break;
          case 429:
            errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
            break;
          case 500:
            errorMessage = 'Erro interno do servidor. Tente novamente.';
            break;
          case 503:
            errorMessage = 'Serviço temporariamente indisponível.';
            break;
          default:
            errorMessage = `Erro ${error.status}: ${error.message}`;
        }
      }

      console.error('Erro interceptado:', error);
      
      // Aqui você pode adicionar um serviço de notificação
      // this.notificationService.showError(errorMessage);
      
      return throwError(() => new Error(errorMessage));
    })
  );
}; 