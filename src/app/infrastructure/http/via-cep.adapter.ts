import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CepPort, EnderecoDTO } from '../../shared/ports/cep.port';

@Injectable({
    providedIn: 'root'
})
export class ViaCepAdapter implements CepPort {
  private http = inject(HttpClient);
  private readonly API_URL = 'https://viacep.com.br/ws';

  buscar(cep: string): Observable<EnderecoDTO | null> {
    const cepNumerico = cep.replace(/\D/g, '');
    if (cepNumerico.length !== 8) {
      return of(null);
    }

    return this.http.get<any>(`${this.API_URL}/${cepNumerico}/json/`).pipe(
      map(response => {
        if (response.erro) {
          return null;
        }
        return {
          cep: response.cep,
          logradouro: response.logradouro,
          bairro: response.bairro,
          cidade: response.localidade,
          estado: response.uf,
          complemento: response.complemento
        };
      }),
      catchError(() => of(null))
    );
  }
}