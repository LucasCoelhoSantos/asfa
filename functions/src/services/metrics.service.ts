import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { Collection, METRIC_FIELDS } from '../types';

export class MetricsService {
  private static readonly METRICS_DOC_ID = 'global';

  static async incrementMetric(field: string, delta: number): Promise<void> {
    try {
      const db = getFirestore();
      const ref = db.collection(Collection.METRICS).doc(this.METRICS_DOC_ID);
      await ref.set({ [field]: FieldValue.increment(delta) }, { merge: true });
    } catch (error) {
      console.error('Erro ao incrementar métrica:', error);
      // Não falha a operação principal por erro de métrica
    }
  }

  static async incrementUsuarios(delta: number): Promise<void> {
    return this.incrementMetric(METRIC_FIELDS.USUARIOS, delta);
  }

  static async incrementPessoas(delta: number): Promise<void> {
    return this.incrementMetric(METRIC_FIELDS.PESSOAS, delta);
  }
}
