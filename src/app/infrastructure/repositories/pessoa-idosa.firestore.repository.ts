import { inject, Injectable } from '@angular/core';
import { Firestore, collection, doc, getDoc, setDoc, updateDoc, addDoc, query, limit, startAfter, getDocs, getCountFromServer, CollectionReference, DocumentData, Timestamp } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PessoaIdosa } from '../../domains/pessoa-idosa/domain/entities/pessoa-idosa.entity';
import { PessoaIdosaRepository, PessoaIdosaListFilters, PessoaIdosaListPage } from '../../domains/pessoa-idosa/domain/repositories/pessoa-idosa.repository';

@Injectable({
    providedIn: 'root',
})
export class PessoaIdosaFirestoreRepository implements PessoaIdosaRepository {
    private firestore: Firestore = inject(Firestore);
    private collectionRef: CollectionReference<DocumentData>;

    constructor() {
        this.collectionRef = collection(this.firestore, 'pessoas-idosas');
    }

    // Função auxiliar para converter Timestamps do Firestore para Datas
    private converterTimestampsParaDatas(data: any): any {
        for (const key in data) {
        if (data[key] instanceof Timestamp) {
            data[key] = data[key].toDate();
        } else if (typeof data[key] === 'object' && data[key] !== null) {
            this.converterTimestampsParaDatas(data[key]);
        }
        }
        return data;
    }

    listar(filtros: PessoaIdosaListFilters): Observable<PessoaIdosa[]> {
        const q = query(this.collectionRef); // Adicionar filtros 'where' aqui
        return from(getDocs(q)).pipe(
            map(querySnapshot =>
                querySnapshot.docs.map(doc => {
                    let dados = this.converterTimestampsParaDatas(doc.data());
                    return PessoaIdosa.rehidratar({ ...dados, id: doc.id });
                })
            )
        );
    }

    obterPorId(id: string): Observable<PessoaIdosa | undefined> {
        const docRef = doc(this.collectionRef, id);
        return from(getDoc(docRef)).pipe(
            map(snapshot => {
                if (!snapshot.exists()) {
                    return undefined;
                }
                let dados = this.converterTimestampsParaDatas(snapshot.data());
                // Usa o rehidratar para reconstruir a entidade rica
                return PessoaIdosa.rehidratar({ ...dados, id: snapshot.id });
            })
        );
    }

    async paginar(tamanho: number, cursor: unknown | null, filtros: PessoaIdosaListFilters): Promise<PessoaIdosaListPage> {
        const q = cursor
            ? query(this.collectionRef, limit(tamanho), startAfter(cursor))
            : query(this.collectionRef, limit(tamanho));

        const querySnapshot = await getDocs(q);
        const countSnapshot = await getCountFromServer(this.collectionRef);

        const pessoas = querySnapshot.docs.map(doc => {
            let dados = this.converterTimestampsParaDatas(doc.data());
            return PessoaIdosa.rehidratar({ ...dados, id: doc.id });
        });

        const proximoCursor = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

        return {
            pessoas,
            cursor: proximoCursor,
            total: countSnapshot.data().count,
            temMais: querySnapshot.docs.length === tamanho,
        };
    }

    criar(pessoa: PessoaIdosa): Observable<string> {
        // Usa toJSON para obter um objeto simples para persistência
        const dados = pessoa.toJSON();
        const { id, ...dataToSave } = dados; // Remove o ID temporário

        return from(addDoc(this.collectionRef, dataToSave)).pipe(
            map(docRef => docRef.id)
        );
    }

    atualizar(pessoa: PessoaIdosa): Observable<void> {
        const docRef = doc(this.collectionRef, pessoa.id);
        // Usa toJSON para obter um objeto simples para persistência
        const dados = pessoa.toJSON();
        const { id, ...dataToUpdate } = dados;

        return from(setDoc(docRef, dataToUpdate));
    }
}