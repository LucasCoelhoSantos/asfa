import { getFirestore } from 'firebase-admin/firestore';
import { RateLimitData, Collection, RATE_LIMIT_CONFIG } from '../types';

export class RateLimitService {
  static async checkRateLimit(uid: string): Promise<boolean> {
    try {
      const db = getFirestore();
      const ref = db.collection(Collection.RATE_LIMITS).doc(uid);
      const snap = await ref.get();
      const now = Date.now();
      
      const data = snap.exists ? (snap.data() as RateLimitData) : null;
      const windowStart = data?.windowStart ?? now;
      let count = data?.count ?? 0;

      if (now - windowStart > RATE_LIMIT_CONFIG.WINDOW_MS) {
        // Reinicia janela
        await ref.set({ 
          windowStart: now, 
          count: 1 
        }, { merge: true });
        return true;
      } else {
        if (count >= RATE_LIMIT_CONFIG.MAX_REQUESTS) {
          return false; // Rate limit excedido
        }
        await ref.set({ 
          windowStart, 
          count: count + 1 
        }, { merge: true });
        return true;
      }
    } catch (error) {
      console.error('Erro ao verificar rate limit:', error);
      return true; // Em caso de erro, permite a operação
    }
  }

  static async clearRateLimit(uid: string): Promise<void> {
    try {
      const db = getFirestore();
      await db.collection(Collection.RATE_LIMITS).doc(uid).delete();
    } catch (error) {
      console.error('Erro ao limpar rate limit:', error);
    }
  }
}
