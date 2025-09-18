import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { EnderecoDTO } from '../../../models/endereco.model';

export interface RespostaViaCep {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EnderecoService {
  private readonly VIA_CEP_BASE_URL = 'https://viacep.com.br/ws';
  private ultimoCepConsultado: string | null = null;

  constructor(private http: HttpClient) {}

  buscarCep(cep: string): Observable<EnderecoDTO | null> {
    const cepLimpo = this.limparCep(cep);
    
    if (!this.validarCep(cepLimpo)) {
      return throwError(() => new Error('CEP deve ter 8 dígitos'));
    }

    if (this.ultimoCepConsultado === cepLimpo) {
      return of(null);
    }

    this.ultimoCepConsultado = cepLimpo;
    return this.fazerRequisicaoViaCep(cepLimpo);
  }

  private fazerRequisicaoViaCep(cep: string): Observable<EnderecoDTO> {
    const url = `${this.VIA_CEP_BASE_URL}/${cep}/json/`;
    
    return this.http.get<RespostaViaCep>(url).pipe(
      map(resposta => {
        if (resposta.erro) {
          throw new Error('CEP não encontrado');
        }
        
        return {
          cep: resposta.cep,
          logradouro: resposta.logradouro || '',
          bairro: resposta.bairro || '',
          cidade: resposta.localidade || '',
          estado: resposta.uf || ''
        };
      }),
      catchError(erro => {
        return throwError(() => new Error('Erro ao buscar CEP. Tente novamente.'));
      })
    );
  }

  validarCep(cep: string): boolean {
    const cepLimpo = cep.replace(/\D/g, '');
    return cepLimpo.length === 8;
  }

  formatarCep(cep: string): string {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      return cepLimpo.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
    return cep;
  }

  limparCep(cep: string): string {
    return cep.replace(/\D/g, '');
  }
}