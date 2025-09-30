import { Injectable } from '@angular/core';
import { Usuario } from '../../modules/usuario/domain/entities/usuario.entity';
import { CargoUsuario } from '../../modules/usuario/domain/value-objects/enums';

@Injectable({ providedIn: 'root' })
export class AutorizacaoService {
  temAcesso(usuario: Usuario | null | undefined, cargosPermitidos: CargoUsuario[]): boolean {
    if (!usuario) return false;
    if (usuario.ativo === false) return false;
    return cargosPermitidos.includes(usuario.cargo);
  }
}