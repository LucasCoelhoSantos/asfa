import { EmailNotificationType } from '../types';

export class ServicoEmailTemplate {
  
  /**
   * Obtém template HTML para o tipo de notificação especificado
   */
  static obterTemplate(tipo: EmailNotificationType): { subject: string; html: string } {
    const templates = {
      [EmailNotificationType.NOVO_CADASTRO_PESSOA_IDOSA]: this.getNovoCadastroTemplate(),
      [EmailNotificationType.ATUALIZACAO_DADOS_IMPORTANTES]: this.getAtualizacaoDadosTemplate(),
      [EmailNotificationType.BACKUP_REALIZADO_SUCESSO]: this.getBackupSucessoTemplate(),
      [EmailNotificationType.CONFIRMACAO_CADASTRO]: this.getConfirmacaoCadastroTemplate(),
      [EmailNotificationType.RESET_SENHA]: this.getResetSenhaTemplate(),
      [EmailNotificationType.LEMBRETE_ATUALIZACAO_DADOS]: this.getLembreteAtualizacaoTemplate(),
      [EmailNotificationType.ERRO_CRITICO]: this.getErroCriticoTemplate(),
      [EmailNotificationType.QUOTA_ARMAZENAMENTO_ATINGIDA]: this.getQuotaArmazenamentoTemplate(),
      [EmailNotificationType.FALHA_BACKUP]: this.getFalhaBackupTemplate(),
      [EmailNotificationType.PARABENS_ANIVERSARIO]: this.getParabensAniversarioTemplate()
    };

    return templates[tipo] || this.getTemplatePadrao();
  }

  /**
   * Template para novo cadastro de pessoa idosa
   */
  private static getNovoCadastroTemplate(): { subject: string; html: string } {
    return {
      subject: 'Novo Cadastro - {{nomePessoa}} - ASFA',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Novo Cadastro - ASFA</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c5aa0;">ASFA</h1>
              <h2 style="color: #666;">Associação Católica Sagrada Família</h2>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #2c5aa0; margin-top: 0;">Novo Cadastro Realizado</h3>
              <p>Uma nova pessoa idosa foi cadastrada no sistema:</p>
              
              <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p><strong>Nome:</strong> {{nomePessoa}}</p>
                <p><strong>Data de Nascimento:</strong> {{dataNascimento}}</p>
                <p><strong>Cadastrado por:</strong> {{usuarioResponsavel}}</p>
                <p><strong>Data do Cadastro:</strong> {{dataCadastro}}</p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px;">
                Este é um email automático do sistema ASFA.<br>
                Para mais informações, entre em contato conosco.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  /**
   * Template para atualização de dados importantes
   */
  private static getAtualizacaoDadosTemplate(): { subject: string; html: string } {
    return {
      subject: 'Atualização de Dados - {{nomePessoa}} - ASFA',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Atualização de Dados - ASFA</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c5aa0;">ASFA</h1>
              <h2 style="color: #666;">Associação Católica Sagrada Família</h2>
            </div>
            
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
              <h3 style="color: #856404; margin-top: 0;">Dados Atualizados</h3>
              <p>Os dados de uma pessoa idosa foram atualizados no sistema:</p>
              
              <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p><strong>Nome:</strong> {{nomePessoa}}</p>
                <p><strong>Campos Alterados:</strong> {{camposAlterados}}</p>
                <p><strong>Atualizado por:</strong> {{usuarioResponsavel}}</p>
                <p><strong>Data da Atualização:</strong> {{dataAtualizacao}}</p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px;">
                Este é um email automático do sistema ASFA.<br>
                Para mais informações, entre em contato conosco.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  /**
   * Template para backup realizado com sucesso
   */
  private static getBackupSucessoTemplate(): { subject: string; html: string } {
    return {
      subject: 'Backup Realizado com Sucesso - ASFA',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Backup Realizado - ASFA</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c5aa0;">ASFA</h1>
              <h2 style="color: #666;">Associação Católica Sagrada Família</h2>
            </div>
            
            <div style="background-color: #d1edff; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #0dcaf0;">
              <h3 style="color: #055160; margin-top: 0;">Backup Concluído com Sucesso</h3>
              <p>O backup dos dados do sistema foi realizado com sucesso:</p>
              
              <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p><strong>Data do Backup:</strong> {{dataBackup}}</p>
                <p><strong>Tamanho do Backup:</strong> {{tamanhoBackup}}</p>
                <p><strong>Coleções Incluídas:</strong> {{colecoesIncluidas}}</p>
                <p><strong>Status:</strong> <span style="color: #198754; font-weight: bold;">Concluído</span></p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px;">
                Este é um email automático do sistema ASFA.<br>
                Para mais informações, entre em contato conosco.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  /**
   * Template para confirmação de cadastro
   */
  private static getConfirmacaoCadastroTemplate(): { subject: string; html: string } {
    return {
      subject: 'Confirmação de Cadastro - ASFA',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Confirmação de Cadastro - ASFA</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c5aa0;">ASFA</h1>
              <h2 style="color: #666;">Associação Católica Sagrada Família</h2>
            </div>
            
            <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #198754;">
              <h3 style="color: #0f5132; margin-top: 0;">Cadastro Confirmado!</h3>
              <p>Olá <strong>{{nomeUsuario}}</strong>,</p>
              <p>Seu cadastro no sistema ASFA foi confirmado com sucesso.</p>
              
              <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p><strong>Email:</strong> {{emailUsuario}}</p>
                <p><strong>Data de Confirmação:</strong> {{dataConfirmacao}}</p>
                <p><strong>Status:</strong> <span style="color: #198754; font-weight: bold;">Status</span></p>
              </div>
              
              <p>Agora você pode acessar o sistema com suas credenciais.</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px;">
                Este é um email automático do sistema ASFA.<br>
                Para mais informações, entre em contato conosco.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  /**
   * Template para reset de senha
   */
  private static getResetSenhaTemplate(): { subject: string; html: string } {
    return {
      subject: 'Reset de Senha - ASFA',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Reset de Senha - ASFA</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c5aa0;">ASFA</h1>
              <h2 style="color: #666;">Associação Católica Sagrada Família</h2>
            </div>
            
            <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #dc3545;">
              <h3 style="color: #721c24; margin-top: 0;">Solicitação de Reset de Senha</h3>
              <p>Olá <strong>{{nomeUsuario}}</strong>,</p>
              <p>Uma solicitação de reset de senha foi realizada para sua conta:</p>
              
              <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p><strong>Email:</strong> {{emailUsuario}}</p>
                <p><strong>Data da Solicitação:</strong> {{dataSolicitacao}}</p>
                <p><strong>IP da Solicitação:</strong> {{ipSolicitacao}}</p>
              </div>
              
              <p><strong>Se você não solicitou este reset, ignore este email.</strong></p>
              <p>Se você solicitou, entre em contato com o administrador do sistema.</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px;">
                Este é um email automático do sistema ASFA.<br>
                Para mais informações, entre em contato conosco.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  /**
   * Template para lembrete de atualização de dados
   */
  private static getLembreteAtualizacaoTemplate(): { subject: string; html: string } {
    return {
      subject: 'Lembrete - Atualização de Dados - ASFA',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Lembrete - ASFA</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c5aa0;">ASFA</h1>
              <h2 style="color: #666;">Associação Católica Sagrada Família</h2>
            </div>
            
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
              <h3 style="color: #856404; margin-top: 0;">Lembrete de Atualização</h3>
              <p>Olá <strong>{{nomeUsuario}}</strong>,</p>
              <p>Este é um lembrete para atualizar os dados cadastrais no sistema:</p>
              
              <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p><strong>Última Atualização:</strong> {{ultimaAtualizacao}}</p>
                <p><strong>Dados que podem precisar de atualização:</strong></p>
                <ul>
                  <li>Informações de contato</li>
                  <li>Endereço</li>
                  <li>Documentos</li>
                  <li>Dados de saúde</li>
                </ul>
              </div>
              
              <p>Mantenha seus dados sempre atualizados para melhor atendimento.</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px;">
                Este é um email automático do sistema ASFA.<br>
                Para mais informações, entre em contato conosco.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  /**
   * Template para erro crítico
   */
  private static getErroCriticoTemplate(): { subject: string; html: string } {
    return {
      subject: 'ALERTA: Erro Crítico - ASFA',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Erro Crítico - ASFA</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #dc3545;">ASFA</h1>
              <h2 style="color: #666;">Associação Católica Sagrada Família</h2>
            </div>
            
            <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #dc3545;">
              <h3 style="color: #721c24; margin-top: 0;">🚨 ERRO CRÍTICO DETECTADO</h3>
              <p>Um erro crítico foi detectado no sistema ASFA:</p>
              
              <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p><strong>Data/Hora:</strong> {{dataErro}}</p>
                <p><strong>Tipo do Erro:</strong> {{tipoErro}}</p>
                <p><strong>Descrição:</strong> {{descricaoErro}}</p>
                <p><strong>Severidade:</strong> <span style="color: #dc3545; font-weight: bold;">CRÍTICA</span></p>
              </div>
              
              <p><strong>Ação necessária:</strong> Verifique o sistema imediatamente.</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px;">
                Este é um email automático do sistema ASFA.<br>
                Para mais informações, entre em contato conosco.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  /**
   * Template para quota de armazenamento atingida
   */
  private static getQuotaArmazenamentoTemplate(): { subject: string; html: string } {
    return {
      subject: 'ALERTA: Quota de Armazenamento - ASFA',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Quota de Armazenamento - ASFA</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #ffc107;">ASFA</h1>
              <h2 style="color: #666;">Associação Católica Sagrada Família</h2>
            </div>
            
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
              <h3 style="color: #856404; margin-top: 0;">⚠️ Quota de Armazenamento Atingida</h3>
              <p>A quota de armazenamento do sistema foi atingida:</p>
              
              <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p><strong>Data/Hora:</strong> {{dataAlerta}}</p>
                <p><strong>Uso Atual:</strong> {{usoAtual}}</p>
                <p><strong>Quota Máxima:</strong> {{quotaMaxima}}</p>
                <p><strong>Percentual:</strong> <span style="color: #dc3545; font-weight: bold;">{{percentualUso}}%</span></p>
              </div>
              
              <p><strong>Ação necessária:</strong> Limpe arquivos desnecessários ou aumente a quota.</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px;">
                Este é um email automático do sistema ASFA.<br>
                Para mais informações, entre em contato conosco.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  /**
   * Template para falha no backup
   */
  private static getFalhaBackupTemplate(): { subject: string; html: string } {
    return {
      subject: 'ALERTA: Falha no Backup - ASFA',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Falha no Backup - ASFA</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #dc3545;">ASFA</h1>
              <h2 style="color: #666;">Associação Católica Sagrada Família</h2>
            </div>
            
            <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #dc3545;">
              <h3 style="color: #721c24; margin-top: 0;">❌ Falha no Backup</h3>
              <p>O backup dos dados do sistema falhou:</p>
              
              <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p><strong>Data/Hora:</strong> {{dataFalha}}</p>
                <p><strong>Motivo da Falha:</strong> {{motivoFalha}}</p>
                <p><strong>Coleções Afetadas:</strong> {{colecoesAfetadas}}</p>
                <p><strong>Status:</strong> <span style="color: #dc3545; font-weight: bold;">Falhou</span></p>
              </div>
              
              <p><strong>Ação necessária:</strong> Verifique o sistema e tente novamente.</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px;">
                Este é um email automático do sistema ASFA.<br>
                Para mais informações, entre em contato conosco.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  /**
   * Template para parabéns de aniversário
   */
  private static getParabensAniversarioTemplate(): { subject: string; html: string } {
    return {
      subject: '🎉 Parabéns pelo seu Aniversário! - ASFA',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Parabéns pelo Aniversário - ASFA</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c5aa0;">ASFA</h1>
              <h2 style="color: #666;">Associação Católica Sagrada Família</h2>
            </div>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 15px; margin-bottom: 20px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 2.5em;">🎉</h1>
              <h2 style="margin: 10px 0; font-size: 1.8em;">Parabéns!</h2>
              <h3 style="margin: 0; font-size: 1.3em;">{{nomePessoa}}</h3>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
              <h3 style="color: #2c5aa0; margin-top: 0;">Que este novo ano de vida seja repleto de:</h3>
              
              <div style="display: flex; justify-content: space-around; margin: 20px 0; flex-wrap: wrap;">
                <div style="text-align: center; margin: 10px;">
                  <div style="font-size: 2em;">❤️</div>
                  <p style="margin: 5px 0; font-weight: bold;">Saúde</p>
                </div>
                <div style="text-align: center; margin: 10px;">
                  <div style="font-size: 2em;">😊</div>
                  <p style="margin: 5px 0; font-weight: bold;">Alegria</p>
                </div>
                <div style="text-align: center; margin: 10px;">
                  <div style="font-size: 2em;">🙏</div>
                  <p style="margin: 5px 0; font-weight: bold;">Bênçãos</p>
                </div>
                <div style="text-align: center; margin: 10px;">
                  <div style="font-size: 2em;">🌟</div>
                  <p style="margin: 5px 0; font-weight: bold;">Paz</p>
                </div>
              </div>
              
              <p style="font-size: 1.1em; color: #666; margin: 20px 0;">
                Hoje você completa <strong>{{idade}} anos</strong> e queremos celebrar esta data especial com você!
              </p>
              
              <p style="font-style: italic; color: #2c5aa0;">
                "Que o Senhor te abençoe e te guarde; que o Senhor faça resplandecer o seu rosto sobre ti e te conceda graça; que o Senhor volte para ti o seu rosto e te dê paz."<br>
                <small>- Números 6:24-26</small>
              </p>
            </div>
            
            <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h4 style="color: #1976d2; margin-top: 0;">Da equipe ASFA</h4>
              <p>Estamos felizes em fazer parte da sua vida e desejamos que este novo ano seja repleto de momentos especiais e muita felicidade!</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px;">
                Este é um email automático do sistema ASFA.<br>
                Para mais informações, entre em contato conosco.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  /**
   * Template padrão para casos não especificados
   */
  private static getTemplatePadrao(): { subject: string; html: string } {
    return {
      subject: 'Notificação - ASFA',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Notificação - ASFA</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c5aa0;">ASFA</h1>
              <h2 style="color: #666;">Associação Católica Sagrada Família</h2>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #2c5aa0; margin-top: 0;">Notificação</h3>
              <p>Você recebeu uma notificação do sistema ASFA.</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px;">
                Este é um email automático do sistema ASFA.<br>
                Para mais informações, entre em contato conosco.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }
}
