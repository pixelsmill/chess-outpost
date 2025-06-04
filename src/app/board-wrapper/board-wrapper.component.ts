import { Component, input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-board-wrapper',
  imports: [],
  templateUrl: './board-wrapper.component.html',
  styleUrl: './board-wrapper.component.scss'
})
export class BoardWrapperComponent implements OnChanges {
  backgroundColor = input<string>('rgb(255, 255, 255)'); // Couleur de fond de l'échiquier
  orientation = input<'white' | 'black'>('white'); // Orientation de l'échiquier

  ngOnChanges(changes: SimpleChanges) {
    if (changes['orientation']) {
      console.log('🎯 BoardWrapper orientation changed from',
        changes['orientation'].previousValue, 'to', this.orientation());
    }
  }

  getHorizontalCoordinates(): string[] {
    // Toujours dans l'ordre standard - c'est l'échiquier qui gère l'inversion visuelle
    const coords = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    console.log('🎯 BoardWrapper horizontalCoordinates:', coords, 'for orientation:', this.orientation());
    return coords;
  }

  getVerticalCoordinates(): string[] {
    // Toujours dans l'ordre standard - c'est l'échiquier qui gère l'inversion visuelle
    const coords = ['8', '7', '6', '5', '4', '3', '2', '1'];
    console.log('🎯 BoardWrapper verticalCoordinates:', coords, 'for orientation:', this.orientation());
    return coords;
  }
}
