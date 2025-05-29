import { Component, Input, signal, computed, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chess } from 'chess.js';
import { ChessService, HeatmapSquare, SquareControl } from '../../services/chess.service';

@Component({
  selector: 'app-heatmap-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './heatmap-board.component.html',
  styleUrl: './heatmap-board.component.scss'
})
export class HeatmapBoardComponent implements OnChanges {
  @Input() position: string = '';
  @Input() orientation: 'white' | 'black' = 'white'; // Orientation de l'échiquier

  private chess = new Chess();

  // Signal pour forcer la réactivité
  private positionSignal = signal(this.position);

  // Tableau des cases heatmap
  board = computed(() => {
    const currentPosition = this.positionSignal();

    // Charger la position dans l'instance Chess
    if (currentPosition) {
      this.chess.load(currentPosition);
    }

    return this.chessService.generateHeatmapBoard(this.chess);
  });

  constructor(private chessService: ChessService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['position']) {
      this.positionSignal.set(this.position);
    }
  }

  getSquareControlStyle(control: SquareControl): any {
    return this.chessService.getSquareControlStyle(control);
  }

  getSquareTooltip(square: HeatmapSquare): string {
    return this.chessService.getHeatmapSquareTooltip(square);
  }
}
