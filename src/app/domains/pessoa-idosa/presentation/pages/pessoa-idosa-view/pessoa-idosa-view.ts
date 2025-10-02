import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { MainMenuComponent } from '../../../../../shared/components/main-menu/main-menu';
import { PessoaIdosaFacade } from '../../../application/pessoa-idosa.facade';
import { PessoaIdosa } from '../../../domain/entities/pessoa-idosa.entity';
import { CpfPipe } from '../../../../../shared/pipes/cpf.pipe';
import { TelefonePipe } from '../../../../../shared/pipes/telefone.pipe';
import { RgPipe } from '../../../../../shared/pipes/rg.pipe';
import { CepPipe } from '../../../../../shared/pipes/cep.pipe';
import { CATEGORIAS_ANEXO_INFO } from '../../../../../shared/constants/app.constants';
import { CategoriaAnexo } from '../../../domain/value-objects/enums'; 

@Component({
    selector: 'app-pessoa-idosa-view',
    standalone: true,
    imports: [CommonModule, RouterModule, MainMenuComponent, CpfPipe, TelefonePipe, RgPipe, CepPipe],
    templateUrl: './pessoa-idosa-view.html'
})
export class PessoaIdosaViewPage implements OnInit {
    private route = inject(ActivatedRoute);
    private facade = inject(PessoaIdosaFacade);
    private location = inject(Location);

    pessoaIdosa$!: Observable<PessoaIdosa | undefined>;
    
    // Expõe o helper para o template
    readonly categoriasAnexoInfo = CATEGORIAS_ANEXO_INFO;
    readonly CategoriaAnexo = CategoriaAnexo;


    ngOnInit(): void {
        this.pessoaIdosa$ = this.route.paramMap.pipe(
        switchMap(params => {
            const id = params.get('id');
            if (id) {
            return this.facade.obterPorId(id);
            }
            return [];
        })
        );
    }

    voltar(): void {
        this.location.back();
    }
}