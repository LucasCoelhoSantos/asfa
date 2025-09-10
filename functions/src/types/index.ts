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
  RATE_LIMITS = 'rate_limits'
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
