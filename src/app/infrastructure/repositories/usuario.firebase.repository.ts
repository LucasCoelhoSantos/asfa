// src/app/infrastructure/repositories/usuario.firebase.repository.ts

import { inject, Injectable } from '@angular/core';
import { Firestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, CollectionReference, DocumentData, } from '@angular/fire/firestore';
import { from, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Usuario } from '../../domains/usuario/domain/entities/usuario.entity';
import { UsuarioRepository, UsuarioListFilters } from '../../domains/usuario/domain/repositories/usuario.repository';
import { SessaoService } from '../../core/services/sessao.service';

@Injectable({
    providedIn: 'root'
})
export class UsuarioFirebaseRepository implements UsuarioRepository {
    private firestore: Firestore = inject(Firestore);
    private sessaoService = inject(SessaoService);
    private collectionRef: CollectionReference<DocumentData>;

    constructor() {
        this.collectionRef = collection(this.firestore, 'usuarios');
    }

    listar(filtros: UsuarioListFilters): Observable<Usuario[]> {
        const q = query(this.collectionRef);
        return from(getDocs(q)).pipe(
            map(querySnapshot =>
                querySnapshot.docs.map(doc => {
                const dados = doc.data();
                return Usuario.rehidratar({ ...dados, id: doc.id } as any);
                })
            )
        );
    }

    obterPorId(id: string): Observable<Usuario | undefined> {
        const docRef = doc(this.collectionRef, id);
        return from(getDoc(docRef)).pipe(
            map(snapshot => {
                if (!snapshot.exists()) {
                return undefined;
                }
                const dados = snapshot.data();
                // Usa o método de fábrica para reconstruir a entidade a partir dos dados do Firestore
                return Usuario.rehidratar({ ...dados, id: snapshot.id } as any);
            })
        );
    }

    obterPorEmail(email: string): Observable<Usuario | undefined> {
        const q = query(this.collectionRef, where('email', '==', email));
        return from(getDocs(q)).pipe(
            map(querySnapshot => {
                if (querySnapshot.empty) {
                return undefined;
                }
                const doc = querySnapshot.docs[0];
                const dados = doc.data();
                return Usuario.rehidratar({ ...dados, id: doc.id } as any);
            })
        );
    }

    criar(usuario: Usuario): Observable<string> {
        const docRef = doc(this.collectionRef); // Gera um novo ID automaticamente
        const dados = usuario.toJSON();
        // Remove o ID do objeto, pois ele já é a chave do documento
        const { id, ...dataToSave } = dados;

        return from(setDoc(docRef, dataToSave)).pipe(
            map(() => docRef.id) // Retorna o novo ID gerado
        );
    }

    atualizar(usuario: Usuario): Observable<void> {
        const docRef = doc(this.collectionRef, usuario.id);
        const dados = usuario.toJSON();
        const { id, ...dataToUpdate } = dados;

        return from(updateDoc(docRef, dataToUpdate));
    }
}