import { Injectable, inject } from '@angular/core';
import { Firestore, collectionData, collection, doc, docData, getDoc, addDoc, updateDoc, setDoc, DocumentReference, query, where, orderBy, limit, startAfter, QueryConstraint, getDocs } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { PessoaIdosa } from '../../models/pessoa-idosa.model';

/**
 * Serviço para CRUD de Pessoas Idosas usando Firestore.
 * Métodos: getAll, getById, create, update, inativar (soft delete)
 */
@Injectable({ providedIn: 'root' })
export class PessoaIdosaService {
  private firestore = inject(Firestore);
  private collectionName = 'pessoasIdosas';
  private collectionRef = collection(this.firestore, this.collectionName);

  /**
   * Retorna todas as pessoas idosas ativas (ativo=true)
   */
  getAll(): Observable<PessoaIdosa[]> {
    const q = query(this.collectionRef, where('ativo', '==', true));
    return collectionData(q, { idField: 'id' }) as Observable<PessoaIdosa[]>;
  }

  /**
   * Retorna uma pessoa idosa pelo id
   */
  getById(id: string): Observable<PessoaIdosa | undefined> {
    const docRef = doc(this.firestore, this.collectionName, id);
    return docData(docRef, { idField: 'id' }) as Observable<PessoaIdosa | undefined>;
  }

  /**
   * Cria uma nova pessoa idosa
   */
  create(pessoa: PessoaIdosa): Promise<any> {
    return addDoc(this.collectionRef, pessoa);
  }

  /**
   * Atualiza uma pessoa idosa existente
   */
  update(id: string, pessoa: Partial<PessoaIdosa>): Promise<void> {
    const docRef = doc(this.firestore, this.collectionName, id);
    return updateDoc(docRef, pessoa);
  }

  /**
   * Inativa (soft delete) uma pessoa idosa
   */
  inativar(id: string): Promise<void> {
    const docRef = doc(this.firestore, this.collectionName, id);
    return updateDoc(docRef, { ativo: false });
  }

  /**
   * Busca paginada real no Firestore, com filtros opcionais.
   * @param pageSize Quantidade por página
   * @param lastDoc Último doc da página anterior (para paginação)
   * @param filtros Objeto com filtros opcionais (nome, cpf, etc)
   * @returns Promise<{ pessoas: PessoaIdosa[], lastDoc: any, total: number }>
   */
  async getPaginated(pageSize: number, lastDoc: any = null, filtros: any = {}): Promise<{ pessoas: PessoaIdosa[], lastDoc: any, total: number }> {
    const constraints: QueryConstraint[] = [orderBy('nome'), limit(pageSize)];
    if (lastDoc) constraints.push(startAfter(lastDoc));
    if (filtros.ativo !== undefined) constraints.push(where('ativo', '==', filtros.ativo));
    if (filtros.nome) constraints.push(where('nome', '>=', filtros.nome), where('nome', '<=', filtros.nome + '\uf8ff'));
    if (filtros.cpf) constraints.push(where('cpf', '==', filtros.cpf));
    // Adicione outros filtros conforme necessário
    const q = query(this.collectionRef, ...constraints);
    const snap = await getDocs(q);
    const pessoas = snap.docs.map(d => ({ ...d.data(), id: d.id }) as PessoaIdosa);
    const last = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;
    // Para total, pode ser necessário uma query separada (ou usar contagem aproximada)
    return { pessoas, lastDoc: last, total: pessoas.length };
  }
}