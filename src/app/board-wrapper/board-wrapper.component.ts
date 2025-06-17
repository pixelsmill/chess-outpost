import { Component, input, OnChanges, SimpleChanges, HostBinding } from '@angular/core';

@Component({
  selector: 'app-board-wrapper',
  imports: [],
  templateUrl: './board-wrapper.component.html',
  styleUrl: './board-wrapper.component.scss'
})
export class BoardWrapperComponent {
  backgroundColor = input<string>('rgb(255, 255, 255)'); // Couleur de fond de l'échiquier
  orientation = input<'white' | 'black'>('white'); // Orientation de l'échiquier

  // Ajouter l'attribut data-orientation au host pour le CSS
  @HostBinding('attr.data-orientation')
  get dataOrientation() {
    return this.orientation();
  }

  getHorizontalCoordinates(): string[] {
    // Toujours dans l'ordre standard - c'est l'échiquier qui gère l'inversion visuelle
    const coords = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    return coords;
  }

  getVerticalCoordinates(): string[] {
    // Toujours dans l'ordre standard - c'est l'échiquier qui gère l'inversion visuelle
    const coords = ['8', '7', '6', '5', '4', '3', '2', '1'];
    return coords;
  }
}
