import { Routes } from '@angular/router';
import { DependenteFormComponent } from './presentation/pages/dependente-form/dependente-form';

export const DEPENDENTE_ROUTES: Routes = [
  { path: 'novo', component: DependenteFormComponent },
  { path: ':id/editar', component: DependenteFormComponent }
];
