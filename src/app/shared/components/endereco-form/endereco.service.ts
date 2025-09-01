import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export interface EnderecoData {
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class EnderecoService {
  private readonly VIA_CEP_BASE_URL = 'https://viacep.com.br/ws';

  constructor(private http: HttpClient) {}

  /**
   * Busca dados de endereço pelo CEP
   * @param cep - CEP no formato 00000000 (apenas números)
   * @returns Observable com os dados do endereço
   */
  buscarCep(cep: string): Observable<EnderecoData> {
    if (!this.validarCep(cep)) {
      return throwError(() => new Error('CEP deve ter 8 dígitos'));
    }

    const url = `${this.VIA_CEP_BASE_URL}/${cep}/json/`;
    
    return this.http.get<ViaCepResponse>(url).pipe(
      map(response => {
        if (response.erro) {
          throw new Error('CEP não encontrado');
        }
        
        return {
          cep: response.cep,
          logradouro: response.logradouro || '',
          bairro: response.bairro || '',
          cidade: response.localidade || '',
          estado: response.uf || ''
        };
      }),
      catchError(error => {
        console.error('Erro ao buscar CEP:', error);
        return throwError(() => new Error('Erro ao buscar CEP. Tente novamente.'));
      })
    );
  }

  /**
   * Valida se o CEP está no formato correto
   * @param cep - CEP a ser validado
   * @returns true se o CEP é válido
   */
  validarCep(cep: string): boolean {
    const cepLimpo = cep.replace(/\D/g, '');
    return cepLimpo.length === 8;
  }

  /**
   * Formata CEP para exibição (00000-000)
   * @param cep - CEP no formato 00000000
   * @returns CEP formatado
   */
  formatarCep(cep: string): string {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      return cepLimpo.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
    return cep;
  }

  /**
   * Remove formatação do CEP
   * @param cep - CEP formatado
   * @returns CEP apenas com números
   */
  limparCep(cep: string): string {
    return cep.replace(/\D/g, '');
  }
}
