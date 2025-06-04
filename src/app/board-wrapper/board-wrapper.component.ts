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
    const coords = this.orientation() === 'white'
      ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
      : ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];
    console.log('🎯 BoardWrapper horizontalCoordinates:', coords, 'for orientation:', this.orientation());
    return coords;
  }

  getVerticalCoordinates(): string[] {
    const coords = this.orientation() === 'white'
      ? ['8', '7', '6', '5', '4', '3', '2', '1']
      : ['1', '2', '3', '4', '5', '6', '7', '8'];
    console.log('🎯 BoardWrapper verticalCoordinates:', coords, 'for orientation:', this.orientation());
    return coords;
  }
}
