import { Component, Input, signal, computed, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chess } from 'chess.js';
import { ChessService, ChessSquare } from '../../services/chess.service';

@Component({
  selector: 'app-classic-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './classic-board.component.html',
  styleUrl: './classic-board.component.scss'
})
export class ClassicBoardComponent implements OnChanges {
  @Input() position: string = '';
  @Input() orientation: 'white' | 'black' = 'white'; // Orientation de l'échiquier

  private chess = new Chess();

  // Signal pour forcer la réactivité
  private positionSignal = signal(this.position);

  // Tableau des cases du damier
  board = computed(() => {
    const currentPosition = this.positionSignal();

    // Charger la position dans l'instance Chess
    if (currentPosition) {
      this.chess.load(currentPosition);
    }

    return this.chessService.generateChessBoard(this.chess);
  });

  constructor(private chessService: ChessService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['position']) {
      this.positionSignal.set(this.position);
    }
  }
}
