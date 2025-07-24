import { Injectable, inject } from '@angular/core';
import { Firestore, collectionData, collection, doc, docData, getDoc, addDoc, updateDoc, setDoc, DocumentReference, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
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
}