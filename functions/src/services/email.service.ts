import * as nodemailer from 'nodemailer';
import { getFirestore } from 'firebase-admin/firestore';
import { 
  EmailData, 
  EmailConfig, 
  EmailNotification, 
  EmailNotificationType, 
  EmailStatus,
  Collection,
  EMAIL_CONFIG 
} from '../types';
import { ServicoEmailTemplate } from './email-template.service';

export class ServicoEmail {
  private transporter: nodemailer.Transporter | null = null;
  private db = getFirestore();

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    try {
      // Configuração para Gmail (pode ser alterada para outros provedores)
      const config: EmailConfig = {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER || '',
          pass: process.env.EMAIL_PASS || ''
        }
      };

      this.transporter = nodemailer.createTransport(config);
      
      console.log('Serviço de email inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar serviço de email:', error);
      this.transporter = null;
    }
  }

  /**
   * Envia um email usando o template especificado
   */
  async enviarEmail(
    tipo: EmailNotificationType,
    destinatario: string,
    dados: Record<string, any> = {}
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        throw new Error('Transporter de email não inicializado');
      }

      const template = await this.obterTemplate(tipo);
      const emailData = this.prepararDadosEmail(template, destinatario, dados);
      
      // Registrar tentativa de envio
      const notificationId = await this.registrarNotificacao(tipo, destinatario, emailData.subject);
      
      try {
        const resultado = await this.transporter.sendMail(emailData);
        
        // Marcar como enviado
        await this.atualizarStatusNotificacao(notificationId, EmailStatus.SENT, resultado.messageId);
        
        console.log(`Email enviado com sucesso para ${destinatario}:`, resultado.messageId);
        return true;
        
      } catch (error) {
        // Marcar como falha
        await this.atualizarStatusNotificacao(notificationId, EmailStatus.FAILED, error as string);
        throw error;
      }
      
    } catch (error) {
      console.error(`Erro ao enviar email para ${destinatario}:`, error);
      return false;
    }
  }

  /**
   * Envia emails em lote
   */
  async enviarEmailsEmLote(
    tipo: EmailNotificationType,
    destinatarios: string[],
    dados: Record<string, any> = {}
  ): Promise<{ sucessos: number; falhas: number }> {
    let sucessos = 0;
    let falhas = 0;

    // Processar em lotes para evitar sobrecarga
    const lotes = this.dividirEmLotes(destinatarios, EMAIL_CONFIG.BATCH_SIZE);
    
    for (const lote of lotes) {
      const promessas = lote.map(destinatario => 
        this.enviarEmail(tipo, destinatario, dados)
          .then(sucesso => sucesso ? sucessos++ : falhas++)
          .catch(() => falhas++)
      );
      
      await Promise.all(promessas);
      
      // Pequena pausa entre lotes
      await this.delay(1000);
    }

    return { sucessos, falhas };
  }

  /**
   * Obtém template de email baseado no tipo
   */
  private async obterTemplate(tipo: EmailNotificationType): Promise<{ subject: string; html: string }> {
    return ServicoEmailTemplate.obterTemplate(tipo);
  }

  /**
   * Prepara dados do email com template e variáveis
   */
  private prepararDadosEmail(
    template: { subject: string; html: string },
    destinatario: string,
    dados: Record<string, any>
  ): EmailData {
    let html = template.html;
    let subject = template.subject;

    // Substituir variáveis no template
    Object.keys(dados).forEach(chave => {
      const valor = dados[chave];
      const regex = new RegExp(`{{${chave}}}`, 'g');
      html = html.replace(regex, valor);
      subject = subject.replace(regex, valor);
    });

    return {
      to: destinatario,
      from: EMAIL_CONFIG.FROM,
      replyTo: EMAIL_CONFIG.REPLY_TO,
      subject,
      html
    };
  }

  /**
   * Registra tentativa de envio de notificação
   */
  private async registrarNotificacao(
    tipo: EmailNotificationType,
    destinatario: string,
    assunto: string
  ): Promise<string> {
    const notification: Omit<EmailNotification, 'id'> = {
      type: tipo,
      recipient: destinatario,
      subject: assunto,
      status: EmailStatus.PENDING,
      metadata: {
        timestamp: Date.now()
      }
    };

    const docRef = await this.db.collection(Collection.EMAIL_NOTIFICATIONS).add(notification);
    return docRef.id;
  }

  /**
   * Atualiza status da notificação
   */
  private async atualizarStatusNotificacao(
    id: string,
    status: EmailStatus,
    detalhes?: string
  ): Promise<void> {
    const updateData: Partial<EmailNotification> = {
      status,
      sentAt: status === EmailStatus.SENT ? Date.now() : undefined,
      error: status === EmailStatus.FAILED ? detalhes : undefined
    };

    await this.db.collection(Collection.EMAIL_NOTIFICATIONS).doc(id).update(updateData);
  }

  /**
   * Divide array em lotes menores
   */
  private dividirEmLotes<T>(array: T[], tamanhoLote: number): T[][] {
    const lotes: T[][] = [];
    for (let i = 0; i < array.length; i += tamanhoLote) {
      lotes.push(array.slice(i, i + tamanhoLote));
    }
    return lotes;
  }

  /**
   * Delay para pausa entre operações
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Verifica se o serviço está configurado corretamente
   */
  async verificarConfiguracao(): Promise<boolean> {
    try {
      if (!this.transporter) {
        return false;
      }

      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Erro na verificação do serviço de email:', error);
      return false;
    }
  }
}
