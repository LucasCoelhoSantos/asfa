import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SessaoService } from './sessao.service';
import { AutenticacaoService } from './autenticacao.service';
import { USUARIO_REPOSITORY, UsuarioRepository } from '../../domains/usuario/domain/repositories/usuario.repository';
import { CargoUsuario } from '../../domains/usuario/domain/value-objects/enums';
import { Usuario } from '../../domains/usuario/domain/entities/usuario.entity';

class MockAuthService {
  identidade$ = of(null); // Padrão: não logado
}

class MockUsuarioRepository {
  obterPorId = (id: string) => of(undefined);
}

describe('SessaoService', () => {
  let service: SessaoService;
  let authService: AutenticacaoService;
  let usuarioRepository: UsuarioRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SessaoService,
        { provide: AutenticacaoService, useClass: MockAuthService },
        { provide: USUARIO_REPOSITORY, useClass: MockUsuarioRepository }
      ]
    });
    service = TestBed.inject(SessaoService);
    authService = TestBed.inject(AutenticacaoService);
    usuarioRepository = TestBed.inject(USUARIO_REPOSITORY);
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  describe('usuario$', () => {
    it('deve retornar null se não houver identidade', (done: DoneFn) => {
      // @ts-ignore
      authService.identidade$ = of(null);
      service.usuario$.subscribe(usuario => {
        expect(usuario).toBeNull();
        done();
      });
    });

    it('deve retornar null se o repositório não encontrar o usuário', (done: DoneFn) => {
      // @ts-ignore
      authService.identidade$ = of({ uid: '123' });
      spyOn(usuarioRepository, 'obterPorId').and.returnValue(of(undefined));
      
      service.usuario$.subscribe(usuario => {
        expect(usuario).toBeNull();
        expect(usuarioRepository.obterPorId).toHaveBeenCalledWith('123');
        done();
      });
    });

    it('deve retornar os dados da sessão do usuário quando encontrado', (done: DoneFn) => {
      const mockUser: Usuario = {
        id: '123',
        nome: 'Teste',
        email: 'teste@asfa.com.br',
        cargo: CargoUsuario.Administrador,
        ativo: true,
        toJSON: () => ({})
      } as Usuario;

      // @ts-ignore
      authService.identidade$ = of({ uid: '123' });
      spyOn(usuarioRepository, 'obterPorId').and.returnValue(of(mockUser));

      service.usuario$.subscribe(usuarioSessao => {
        expect(usuarioSessao).toEqual({
          id: '123',
          nome: 'Teste',
          email: 'teste@asfa.com.br',
          cargo: CargoUsuario.Administrador
        });
        expect(usuarioRepository.obterPorId).toHaveBeenCalledWith('123');
        done();
      });
    });
  });

  describe('temCargo', () => {
    it('deve retornar false se o usuário for nulo', (done: DoneFn) => {
      // @ts-ignore
      service.usuario$ = of(null);
      service.temCargo([CargoUsuario.Administrador]).subscribe(temPermissao => {
        expect(temPermissao).toBeFalse();
        done();
      });
    });

    it('deve retornar false se o cargo do usuário não estiver na lista de permitidos', (done: DoneFn) => {
      const usuarioSessao = { id: '1', nome: 'A', email: 'a@a.com', cargo: CargoUsuario.Usuario };
      // @ts-ignore
      service.usuario$ = of(usuarioSessao);

      service.temCargo([CargoUsuario.Administrador]).subscribe(temPermissao => {
        expect(temPermissao).toBeFalse();
        done();
      });
    });

    it('deve retornar true se o cargo do usuário estiver na lista de permitidos', (done: DoneFn) => {
      const usuarioSessao = { id: '1', nome: 'A', email: 'a@a.com', cargo: CargoUsuario.Administrador };
      // @ts-ignore
      service.usuario$ = of(usuarioSessao);

      service.temCargo([CargoUsuario.Administrador]).subscribe(temPermissao => {
        expect(temPermissao).toBeTrue();
        done();
      });
    });
  });
});