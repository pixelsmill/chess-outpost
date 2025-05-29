import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-board-wrapper',
  imports: [],
  templateUrl: './board-wrapper.component.html',
  styleUrl: './board-wrapper.component.scss'
})
export class BoardWrapperComponent {
  @Input() backgroundColor: string = 'rgb(255, 255, 255)'; // Couleur de fond de l'échiquier
}
