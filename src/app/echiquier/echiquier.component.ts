import { Component, OnInit, OnChanges, SimpleChanges, Input, signal, computed, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chess, Square } from 'chess.js';
import { ChessService, ChessSquare } from '../services/chess.service';
import { SquareComponent } from '../square/square.component';

@Component({
  selector: 'app-echiquier',
  standalone: true,
  imports: [CommonModule, SquareComponent],
  templateUrl: './echiquier.component.html',
  styleUrl: './echiquier.component.scss'
})
export class EchiquierComponent implements OnInit, OnChanges {
  @Input() externalPosition?: string; // Position venant du parent (navigation PGN)
  @Input() disableClicks = false; // Désactiver les clics pendant la navigation

  chess = new Chess();

  // Signaux pour la réactivité
  position = signal(this.chess.fen());
  selectedSquare = signal<string | null>(null);

  // Événement pour notifier les changements de position
  @Output() positionChange = new EventEmitter<string>();

  // Tableau de l'échiquier via le service
  board = computed(() => {
    const currentPosition = this.position();
    return this.chessService.generateChessBoard(this.chess);
  });

  constructor(private chessService: ChessService) { }

  ngOnInit() {
    this.updatePosition();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Synchroniser avec la position externe (navigation PGN)
    if (changes['externalPosition'] && this.externalPosition) {
      try {
        this.chess.load(this.externalPosition);
        this.position.set(this.externalPosition);
        this.selectedSquare.set(null); // Désélectionner lors de la navigation
      } catch (error) {
        console.error('Erreur lors du chargement de la position externe:', error);
      }
    }
  }

  onSquareClick(square: string) {
    // Ne pas permettre les clics si on est en mode navigation
    if (this.disableClicks) {
      return;
    }

    const currentSelected = this.selectedSquare();

    if (currentSelected === square) {
      // Désélectionner si on clique sur la même case
      this.selectedSquare.set(null);
      return;
    }

    if (currentSelected) {
      // Tentative de mouvement
      try {
        const move = this.chess.move({
          from: currentSelected as Square,
          to: square as Square,
          promotion: 'q' // Auto-promotion en reine
        });

        if (move) {
          this.updatePosition();
          this.selectedSquare.set(null);
        }
      } catch (error) {
        // Mouvement invalide, sélectionner la nouvelle case
        this.selectedSquare.set(square);
      }
    } else {
      // Sélectionner une nouvelle case
      const piece = this.chess.get(square as Square);
      if (piece && piece.color === this.chess.turn()) {
        this.selectedSquare.set(square);
      }
    }
  }

  updatePosition() {
    const newPosition = this.chess.fen();
    this.position.set(newPosition);
    this.positionChange.emit(newPosition);
  }

  resetGame() {
    this.chess.reset();
    this.updatePosition();
    this.selectedSquare.set(null);
  }

  // Délégation vers le service
  getPieceSymbol(piece: any): string {
    return this.chessService.getPieceSymbol(piece);
  }

  isSquareSelected(square: string): boolean {
    return this.selectedSquare() === square;
  }

  getCurrentTurn(): string {
    return this.chess.turn() === 'w' ? 'Blancs' : 'Noirs';
  }

  isGameOver(): boolean {
    return this.chess.isGameOver();
  }

  getGameStatus(): string {
    if (this.chess.isCheckmate()) {
      return `Échec et mat ! ${this.chess.turn() === 'w' ? 'Noirs' : 'Blancs'} gagnent`;
    }
    if (this.chess.isStalemate()) {
      return 'Pat - Match nul';
    }
    if (this.chess.isDraw()) {
      return 'Match nul';
    }
    if (this.chess.isCheck()) {
      return `Échec au roi ${this.getCurrentTurn()}`;
    }
    return `Tour des ${this.getCurrentTurn()}`;
  }

  getSquareTooltip(square: ChessSquare): string {
    return this.chessService.getChessSquareTooltip(square);
  }
}
