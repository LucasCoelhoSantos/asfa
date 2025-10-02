export class DominioErro extends Error {
    constructor(message: string) {
      super(message);
      this.name = this.constructor.name;
    }
  }
  
  export class ValorInvalidoErro extends DominioErro {
    constructor(campo: string, valor: string, regra: string) {
      super(`O campo "${campo}" com valor "${valor}" é inválido. Motivo: ${regra}.`);
    }
  }
  
  export class CampoObrigatorioErro extends DominioErro {
    constructor(campo: string) {
      super(`O campo "${campo}" é obrigatório.`);
    }
  }