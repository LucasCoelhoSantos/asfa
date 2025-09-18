export interface Endereco {
    cep: string;
    moradia: string;
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
}

export interface EnderecoDTO {
    cep: string;
    logradouro: string;
    bairro: string;
    cidade: string;
    estado: string;
}