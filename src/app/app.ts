import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificacoesComponent } from './shared/components/notificacoes/notificacoes.component';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
registerLocaleData(localePt, 'pt-BR');

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NotificacoesComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('asfa');
}