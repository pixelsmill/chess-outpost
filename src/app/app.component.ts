import { Component } from '@angular/core';
import { EchiquierComponent } from './echiquier/echiquier.component';

@Component({
  selector: 'app-root',
  imports: [EchiquierComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'hotpawn';
}
