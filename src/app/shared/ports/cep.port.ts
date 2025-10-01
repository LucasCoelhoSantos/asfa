import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export interface EnderecoDTO {
  cep: string;
  logradouro: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export const CEP_PORT = new InjectionToken<CepPort>('CEP_PORT');

export interface CepPort {
  buscar(cep: string): Observable<EnderecoDTO | null>;
}