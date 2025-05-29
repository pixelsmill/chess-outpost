import { Component, Input, signal, computed, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chess } from 'chess.js';
import { ChessService, SquareControl, HeatmapSquare } from '../services/chess.service';
import { SquareComponent } from '../square/square.component';

@Component({
  selector: 'app-heatmap',
  standalone: true,
  imports: [CommonModule, SquareComponent],
  templateUrl: './heatmap.component.html',
  styleUrl: './heatmap.component.scss'
})
export class HeatmapComponent implements OnChanges {
  @Input() position: string = '';

  private chess = new Chess();

  // Signal pour forcer la réactivité
  private positionSignal = signal(this.position);

  // Tableau de la heatmap via le service
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
      this.positionSignal.set(changes['position'].currentValue);
    }
  }

  // Délégation vers le service
  getPieceSymbol(piece: any): string {
    return this.chessService.getPieceSymbol(piece);
  }

  getSquareControlStyle(control: SquareControl): any {
    return this.chessService.getSquareControlStyle(control);
  }

  getSquareTooltip(square: HeatmapSquare): string {
    return this.chessService.getHeatmapSquareTooltip(square);
  }
}
