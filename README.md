<div align="center">
	<img src="./public/asfa-logo.png" alt="ASFA" widthwidth="250" height="250" />
	<h1>ASFA - Associação Católica Sagrada Família</h1>
	<h2>Sistema de Gestão de Pessoas Idosas</h2>
	<a href="./README-US.md">[🇺🇸]</a>
</div>

## Sobre o Projeto

O **ASFA** é uma aplicação web desenvolvida em **Angular 20.1.0** e **Firebase**. O objetivo do sistema é facilitar o controle das pessoas idosas que frequentam a Associação Católica Sagrada Família, permitindo o registro de suas informações pessoais, dados de seus dependentes, e a geração de relatórios em PDF para para fins de documentação e impressão.

## Funcionalidades

- Cadastro de pessoas idosas com informações detalhadas;
- Cadastro de dependentes vinculados às pessoas idosas;
- Upload de documentos vinculados às pessoas idosas;
- Cadastro de usuários do sistema (apenas usuários admin tem esse funcionalidade);
- Consulta (com filtros), atualização e inativação de registros;
- Exportação dos dados em formato PDF para impressão;
- Interface de fácil utilização;
- Backup automático dos dados;
- Serviços de notificação por email.

## Tecnologias Utilizadas

### Frontend
- **Angular 20.1.0** - Framework principal
- **TypeScript 5.8.2** - Linguagem de programação
- **Bootstrap 5.3.8** - Framework CSS
- **Bootstrap Icons 1.13.1** - Ícones
- **SCSS** - Pré-processador CSS

### Backend
- **Firebase Authentication** - Autenticação de usuários
- **Firestore** - Banco de dados NoSQL
- **Firebase Storage** - Armazenamento de arquivos
- **Firebase Functions** - Funções serverless
- **Firebase Hosting** - Hospedagem

### APIs Externas
- **ViaCEP** - Consulta de endereços por CEP

## Requisitos

- Computador ou celular com conexão com internet.

## Estrutura do Projeto

```
/asfa
    /public                 	// Arquivos compartilhados
    /src
	    /app
		    /core           	// Serviços, singleton, guards, interceptors, helpers
			    /guards
				/interceptors
			    /services
		    /features       	// Módulos de funcionalidades
		    /models         	// Interfaces e tipos
		    /shared         	// Componentes, pipes, diretivas reutilizáveis
		/environments       	// Configurações de ambiente
        app.config.ts			// Providers globais
        app.routes.ts       	// Rotas principais
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