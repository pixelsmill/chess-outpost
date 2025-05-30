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
  @Input() isMultiplayer = false; // Mode multijoueur - ne pas jouer localement
  @Input() orientation: 'white' | 'black' = 'white'; // Orientation de l'échiquier

  chess = new Chess();

  // Signaux pour la réactivité
  position = signal(this.chess.fen());
  selectedSquare = signal<string | null>(null);

  // Événement pour notifier les changements de position
  @Output() positionChange = new EventEmitter<string>();

  // Événement pour notifier les coups joués (pour le multijoueur)
  @Output() moveChange = new EventEmitter<{ from: string, to: string, promotion?: string }>();

  // Tableau de l'échiquier via le service
  board = computed(() => {
    const currentPosition = this.position();
    const boardSquares = this.chessService.generateChessBoard(this.chess);

    // Si orientation black, inverser l'ordre des cases
    if (this.orientation === 'black') {
      return boardSquares.reverse();
    }

    return boardSquares;
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
    console.log('🎯 EchiquierComponent onSquareClick:', { square, disableClicks: this.disableClicks, isMultiplayer: this.isMultiplayer });

    // Ne pas permettre les clics si on est en mode navigation
    if (this.disableClicks) {
      console.log('🎯 Clicks disabled, ignoring');
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
      console.log('🎯 Attempting move from', currentSelected, 'to', square);

      if (this.isMultiplayer) {
        // En mode multijoueur : valider le coup AVANT de l'émettre
        try {
          // Créer une copie temporaire pour tester la validité
          const tempChess = new Chess(this.chess.fen());
          const move = tempChess.move({
            from: currentSelected as Square,
            to: square as Square,
            promotion: 'q' // Auto-promotion en reine
          });

          if (move) {
            console.log('🎯 Valid move, emitting moveChange:', move);
            // Coup valide : émettre sans modifier l'état local
            this.moveChange.emit({
              from: move.from,
              to: move.to,
              promotion: move.promotion
            });
            this.selectedSquare.set(null);
          } else {
            console.log('🎯 Invalid move, selecting target square');
            // Mouvement invalide, essayer de sélectionner la case de destination
            const piece = this.chess.get(square as Square);
            if (piece && piece.color === this.chess.turn()) {
              this.selectedSquare.set(square);
            } else {
              this.selectedSquare.set(null);
            }
          }
        } catch (error) {
          console.log('🎯 Move error:', error);
          // En cas d'erreur, désélectionner
          this.selectedSquare.set(null);
        }
      } else {
        // Mode local : jouer le coup normalement
        try {
          const move = this.chess.move({
            from: currentSelected as Square,
            to: square as Square,
            promotion: 'q' // Auto-promotion en reine
          });

          if (move) {
            console.log('🎯 Local mode: move played successfully');
            // Émettre le coup joué
            this.moveChange.emit({
              from: move.from,
              to: move.to,
              promotion: move.promotion
            });

            this.updatePosition();
            this.selectedSquare.set(null);
          }
        } catch (error) {
          console.log('🎯 Local mode: invalid move, selecting new square');
          // Mouvement invalide, sélectionner la nouvelle case
          this.selectedSquare.set(square);
        }
      }
    } else {
      // Sélectionner une nouvelle case
      console.log('🎯 Selecting new square:', square);
      const piece = this.chess.get(square as Square);
      if (piece && piece.color === this.chess.turn()) {
        console.log('🎯 Valid piece selected:', piece);
        this.selectedSquare.set(square);
      } else {
        console.log('🎯 No valid piece on this square');
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
    return this.chess.turn() === 'w' ? 'White' : 'Black';
  }

  isGameOver(): boolean {
    return this.chess.isGameOver();
  }

  getGameStatus(): string {
    if (this.chess.isCheckmate()) {
      return `Checkmate! ${this.chess.turn() === 'w' ? 'Black' : 'White'} wins`;
    }

    if (this.chess.isStalemate()) {
      return 'Stalemate!';
    }

    if (this.chess.isDraw()) {
      return 'Draw!';
    }

    return `${this.getCurrentTurn()} to move`;
  }

  getSquareTooltip(square: ChessSquare): string {
    return this.chessService.getChessSquareTooltip(square);
  }
}
