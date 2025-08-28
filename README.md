<div align="center">
	<img src="./public/asfa-logo.png" alt="ASFA" widthwidth="250" height="250" />
	<h1>ASFA - Associação Católica Sagrada Família</h1>
	<a href="./README-US.md">[🇺🇸]</a>
</div>

## Sobre o Projeto

O ASFA é uma aplicação web desenvolvida em Angular e Firebase. O objetivo do sistema é facilitar o controle das pessoas idosas que frequentam a Associação Católica Sagrada Família, permitindo o registro de suas informações pessoais, dados de seus dependentes, e a geração de relatórios em PDF para para fins de documentação e impressão.

## Funcionalidades

- Cadastro de pessoas idosas com informações detalhadas;
- Cadastro de dependentes vinculados às pessoas idosas;
- Cadastro de usuários do sistema (apenas usuários admin tem esse funcionalidade);
- Consulta, atualização e inativação de registros;
- Exportação dos dados em formato PDF para impressão;
- Interface de fácil utilização;
- Backup automático dos dados;
- Serviços de notificação por email.

## Tecnologias Utilizadas

- Linguagem: Angular;
- Banco de Dados: Firebase;
- Webservice de CEP: ViaCep.

## Requisitos

- Computador ou celular com conexão com internet.

## Estrutura do Projeto

```
/asfa
    /public                 // Arquivos compartilhados
    /src
	    /app
		    /core           // Serviços, singleton, guards, interceptors, helpers
			    /guards
				/interceptors
			    /services
		    /features       // Módulos de funcionalidades
		    /models         // Interfaces e tipos
		    /shared         // Componentes, pipes, diretivas reutilizáveis
		/environments       // Configurações de ambiente
        app.config.ts       // Providers globais
        app.routes.ts       // Rotas principais
```

## Telas Disponíveis

Atualmente, o sistema conta com as seguintes telas implementadas:

1. Tela de Login de Usuário:
Permite a autenticação dos usuários.

2. Menu Principal:
Tela principal para gerenciamento dos registros. Permite visualizar, adicionar, editar ou inativar cadastros de pessoas idosas.

3. Cadastro de Pessoas Idosas:
Formulário para inserção ou edição dos dados das pessoas idosas.

4. Cadastro de Dependentes:
É uma parte do formulário de pessoas idosas, é usado para registro de dependentes associados às pessoas idosas.

5. Cadastro de usuários:
Formulário para inserção ou edição dos dados dos usuários do sistema, apenas para usuários admins.

## Futuras Implementações

- Encaminhamentos;
- Agendamento de visitas domiciliares;
- Ligações;
- Doações de kits alimentares;
- Doações diversas;
- Atendimentos.

## Licença

Este projeto é de uso exclusivo da Associação Católica Sagrada Família. Distribuição ou uso comercial não autorizados.