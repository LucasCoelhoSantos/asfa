// ========== Interfaces e Tipos ==========
export interface AuditRecord {
  collection: string;
  docId: string;
  action: string;
  actorUid: string | null;
  before: any;
  after: any;
  timestamp: number;
}

export interface RateLimitData {
  windowStart: number;
  count: number;
}

export interface UsuarioData {
  email?: string;
  ativo?: boolean;
  createdBy?: string;
  updatedBy?: string;
  [key: string]: any;
}

export interface PessoaIdosaData {
  anexos?: AnexoData[];
  ativo?: boolean;
  createdBy?: string;
  updatedBy?: string;
  [key: string]: any;
}

export interface AnexoData {
  path?: string;
  [key: string]: any;
}

export interface BackupConfig {
  collections: string[];
  retentionDays: number;
  schedule: string;
}

export interface MetricData {
  usuarios?: number;
  pessoas?: number;
  [key: string]: number | undefined;
}

// ========== Email Types ==========
export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface EmailData {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  from?: string;
  replyTo?: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  path?: string;
}

export interface EmailNotification {
  id: string;
  type: EmailNotificationType;
  recipient: string;
  subject: string;
  status: EmailStatus;
  sentAt?: number;
  error?: string;
  metadata?: Record<string, any>;
}

export interface BirthdayData {
  nome: string;
  email: string;
  dataNascimento: string;
  idade: number;
}

// ========== Enums ==========
export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  ACTIVATE = 'activate',
  INACTIVATE = 'inactivate'
}

export enum Collection {
  USUARIOS = 'usuarios',
  PESSOAS_IDOSAS = 'pessoas-idosas',
  AUDITS = 'audits',
  METRICS = 'metrics',
  RATE_LIMITS = 'rate_limits',
  EMAIL_NOTIFICATIONS = 'email_notifications',
  BACKUPS = 'backups'
}

export enum EmailNotificationType {
  // Notificações Administrativas
  NOVO_CADASTRO_PESSOA_IDOSA = 'novo_cadastro_pessoa_idosa',
  ATUALIZACAO_DADOS_IMPORTANTES = 'atualizacao_dados_importantes',
  BACKUP_REALIZADO_SUCESSO = 'backup_realizado_sucesso',
  
  // Notificações de Usuário
  CONFIRMACAO_CADASTRO = 'confirmacao_cadastro',
  RESET_SENHA = 'reset_senha',
  LEMBRETE_ATUALIZACAO_DADOS = 'lembrete_atualizacao_dados',
  
  // Notificações de Sistema
  ERRO_CRITICO = 'erro_critico',
  QUOTA_ARMAZENAMENTO_ATINGIDA = 'quota_armazenamento_atingida',
  FALHA_BACKUP = 'falha_backup',
  
  // Notificações de Aniversário
  PARABENS_ANIVERSARIO = 'parabens_aniversario'
}

export enum EmailStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  RETRY = 'retry'
}

// ========== Constants ==========
export const RATE_LIMIT_CONFIG = {
  WINDOW_MS: 60_000, // 1 minuto
  MAX_REQUESTS: 10
} as const;

export const BACKUP_CONFIG: BackupConfig = {
  collections: ['usuarios', 'pessoas-idosas'],
  retentionDays: 28, // 4 semanas
  schedule: 'every monday 02:00'
} as const;

export const METRIC_FIELDS = {
  USUARIOS: 'usuarios',
  PESSOAS: 'pessoas'
} as const;

export const EMAIL_CONFIG = {
  FROM: 'ASFA - Associação Católica Sagrada Família <noreply@asfa.org.br>',
  REPLY_TO: 'contato@asfa.org.br',
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 5000,
  BATCH_SIZE: 50
} as const;

export const EMAIL_TEMPLATES = {
  NOVO_CADASTRO_PESSOA_IDOSA: 'novo-cadastro-pessoa-idosa',
  ATUALIZACAO_DADOS_IMPORTANTES: 'atualizacao-dados-importantes',
  BACKUP_REALIZADO_SUCESSO: 'backup-realizado-sucesso',
  CONFIRMACAO_CADASTRO: 'confirmacao-cadastro',
  RESET_SENHA: 'reset-senha',
  LEMBRETE_ATUALIZACAO_DADOS: 'lembrete-atualizacao-dados',
  ERRO_CRITICO: 'erro-critico',
  QUOTA_ARMAZENAMENTO_ATINGIDA: 'quota-armazenamento-atingida',
  FALHA_BACKUP: 'falha-backup',
  PARABENS_ANIVERSARIO: 'parabens-aniversario'
} as const;
