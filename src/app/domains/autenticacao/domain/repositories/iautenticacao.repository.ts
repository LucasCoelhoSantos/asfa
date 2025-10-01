import { User } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { Usuario } from '../../../usuario/domain/entities/usuario.entity';

export abstract class IAutenticacaoRepository {
  abstract get usuarioLogado$(): Observable<User | null>;
  abstract get usuarioComCargo$(): Observable<(Usuario & { cargo?: string }) | null>;
  
  abstract entrarComEmailESenha(email: string, senha: string): Promise<any>;
  abstract sair(): Observable<void>;
}