import { Component, OnInit, OnChanges, SimpleChanges, Input, signal, computed, Output, EventEmitter, ViewChild, ElementRef, QueryList, ViewChildren, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chess, Square } from 'chess.js';
import { ChessService, ChessSquare } from '../services/chess.service';
import { ChessSquareComponent, ChessSquareData } from '../chess-square/chess-square.component';
import { ChessPieceComponent, PiecePosition, ChessPiece } from '../chess-piece/chess-piece.component';

@Component({
  selector: 'app-echiquier',
  standalone: true,
  imports: [CommonModule, ChessSquareComponent, ChessPieceComponent],
  templateUrl: './echiquier.component.html',
  styleUrl: './echiquier.component.scss'
})
export class EchiquierComponent implements OnInit, OnChanges {
  @Input() externalPosition?: string; // Position venant du parent (navigation PGN)
  @Input() disableClicks = false; // Désactiver les clics pendant la navigation
  @Input() isMultiplayer = false; // Mode multijoueur - ne pas jouer localement
  @Input() orientation: 'white' | 'black' = 'white'; // Orientation de l'échiquier
  @Input() enableDragDrop = true; // Activer le drag & drop
  @Input() showCoordinates = true; // Afficher les coordonnées
  @Input() squareSize = 60; // Taille des cases en pixels
  @Input() boardScale = 1; // Échelle appliquée à tout l'échiquier

  @ViewChild('boardContainer', { static: true }) boardContainer!: ElementRef<HTMLElement>;
  @ViewChildren(ChessPieceComponent) pieceComponents!: QueryList<ChessPieceComponent>;

  chess = new Chess();

  // Signaux pour la réactivité
  position = signal(this.chess.fen());
  selectedSquare = signal<string | null>(null);
  possibleMoves = signal<string[]>([]);
  lastMove = signal<{ from: string, to: string } | null>(null);

  // Événements
  @Output() positionChange = new EventEmitter<string>();
  @Output() moveChange = new EventEmitter<{ from: string, to: string, promotion?: string }>();

  // Données des cases de l'échiquier (statiques)
  squares = computed(() => {
    const squares: ChessSquareData[] = [];

    // Générer les cases dans le même ordre que pour les pièces
    for (let rank = 1; rank <= 8; rank++) {
      for (let file = 1; file <= 8; file++) {
        const square = String.fromCharCode(96 + file) + rank; // a1, b1, etc.
        const isLight = (rank + file) % 2 === 0;
        const lastMoveData = this.lastMove();

        squares.push({
          square,
          rank,
          file,
          isLight,
          isHighlighted: this.selectedSquare() === square,
          isLastMove: lastMoveData ? (lastMoveData.from === square || lastMoveData.to === square) : false,
          isCheck: this.isSquareInCheck(square),
          isPossibleMove: this.possibleMoves().includes(square)
        });
      }
    }

    // Réorganiser les cases pour l'affichage en grid selon l'orientation
    const gridSquares: ChessSquareData[] = [];

    if (this.orientation === 'white') {
      // Pour orientation blanche : rang 8 en haut, rang 1 en bas
      for (let rank = 8; rank >= 1; rank--) {
        for (let file = 1; file <= 8; file++) {
          const square = String.fromCharCode(96 + file) + rank;
          const squareData = squares.find(s => s.square === square);
          if (squareData) gridSquares.push(squareData);
        }
      }
    } else {
      // Pour orientation noire : rang 1 en haut, rang 8 en bas
      for (let rank = 1; rank <= 8; rank++) {
        for (let file = 8; file >= 1; file--) {
          const square = String.fromCharCode(96 + file) + rank;
          const squareData = squares.find(s => s.square === square);
          if (squareData) gridSquares.push(squareData);
        }
      }
    }

    return gridSquares;
  });

  // Positions des pièces (dynamiques)
  pieces = computed(() => {
    const currentPosition = this.position();
    const pieces: PiecePosition[] = [];

    // Générer les positions des pièces
    for (let rank = 1; rank <= 8; rank++) {
      for (let file = 1; file <= 8; file++) {
        const square = String.fromCharCode(96 + file) + rank;
        const piece = this.chess.get(square as Square);

        if (piece) {
          const { x, y } = this.getSquareCoordinates(square);
          pieces.push({
            square,
            piece: {
              type: piece.type,
              color: piece.color
            },
            x,
            y
          });
        }
      }
    }

    return pieces;
  });

  constructor(private chessService: ChessService) {
    // Effect pour synchroniser les positions des pièces
    effect(() => {
      const currentPieces = this.pieces();
      // L'effet se déclenche automatiquement quand pieces() change
      // Cela garantit que les ViewChildren sont synchronisés
    });
  }

  ngOnInit() {
    this.updatePosition();
    this.updatePossibleMoves();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Synchroniser avec la position externe (navigation PGN)
    if (changes['externalPosition'] && this.externalPosition) {
      try {
        this.chess.load(this.externalPosition);
        this.position.set(this.externalPosition);
        this.selectedSquare.set(null);
        this.possibleMoves.set([]);
      } catch (error) {
        console.error('Erreur lors du chargement de la position externe:', error);
      }
    }
  }

  // Calculer les coordonnées pixel d'une case
  private getSquareCoordinates(square: string): { x: number, y: number } {
    const file = square.charCodeAt(0) - 97; // a=0, b=1, etc.
    const rank = parseInt(square[1]) - 1;    // 1=0, 2=1, etc.

    let x, y;

    if (this.orientation === 'white') {
      x = file * this.squareSize;
      y = (7 - rank) * this.squareSize;
    } else {
      x = (7 - file) * this.squareSize;
      y = rank * this.squareSize;
    }

    return { x, y };
  }

  // Obtenir la case à partir des coordonnées pixel
  private getSquareFromCoordinates(x: number, y: number): string | null {
    const boardRect = this.boardContainer.nativeElement.getBoundingClientRect();
    const relativeX = x - boardRect.left;
    const relativeY = y - boardRect.top;

    if (relativeX < 0 || relativeY < 0 || relativeX >= boardRect.width || relativeY >= boardRect.height) {
      return null;
    }

    // Tenir compte du scaling : les dimensions réelles sont multipliées par boardScale
    const scaledSquareSize = this.squareSize * this.boardScale;
    const file = Math.floor(relativeX / scaledSquareSize);
    const rank = Math.floor(relativeY / scaledSquareSize);

    let square: string;

    if (this.orientation === 'white') {
      square = String.fromCharCode(97 + file) + (8 - rank);
    } else {
      square = String.fromCharCode(97 + (7 - file)) + (rank + 1);
    }

    console.log('🎯 getSquareFromCoordinates:', {
      x, y,
      boardRect: { left: boardRect.left, top: boardRect.top, width: boardRect.width, height: boardRect.height },
      relativeX, relativeY,
      squareSize: this.squareSize,
      boardScale: this.boardScale,
      scaledSquareSize,
      file, rank,
      square
    });

    return square;
  }

  // Gestionnaires d'événements
  onSquareClick(square: string) {
    console.log('🎯 EchiquierComponent onSquareClick:', { square, disableClicks: this.disableClicks });

    if (this.disableClicks) {
      console.log('🎯 Clicks disabled, ignoring');
      return;
    }

    this.handleSquareSelection(square);
  }

  onPieceClick(square: string) {
    console.log('🎯 EchiquierComponent onPieceClick:', { square, disableClicks: this.disableClicks });

    if (this.disableClicks) {
      console.log('🎯 Clicks disabled, ignoring');
      return;
    }

    this.handleSquareSelection(square);
  }

  onDragStart(event: { square: string, piece: ChessPiece }) {
    console.log('🎯 Drag started:', event);

    if (this.disableClicks) return;

    // Vérifier que c'est bien le tour du joueur
    if (event.piece.color !== this.chess.turn()) {
      console.log('🎯 Not this player turn, ignoring drag');
      return;
    }

    // Sélectionner la pièce qui commence le drag
    this.selectedSquare.set(event.square);
    this.updatePossibleMoves();
  }

  onDragEnd(event: { from: string, to: string, piece: ChessPiece }) {
    console.log('🎯 Drag ended:', event);

    if (this.disableClicks) return;

    // Tenter le mouvement et capturer le résultat
    const moveSuccessful = this.attemptMove(event.from, event.to);

    if (!moveSuccessful) {
      // Si le mouvement a échoué, forcer le repositionnement de la pièce
      const pieceComponent = this.pieceComponents.find(p => p.position.square === event.from);
      if (pieceComponent) {
        pieceComponent.resetPosition();
      }
    }
  }

  onDragCancel(event: { square: string, piece: ChessPiece }) {
    console.log('🎯 Drag cancelled:', event);
    // La pièce reviendra automatiquement à sa position
  }

  onCoordinateRequest(event: { clientX: number, clientY: number, callback: (square: string | null) => void }) {
    const targetSquare = this.getSquareFromCoordinates(event.clientX, event.clientY);
    event.callback(targetSquare);
  }

  // Logique de sélection et de mouvement
  private handleSquareSelection(square: string) {
    const currentSelected = this.selectedSquare();

    if (currentSelected === square) {
      // Désélectionner si on clique sur la même case
      this.selectedSquare.set(null);
      this.possibleMoves.set([]);
      return;
    }

    if (currentSelected) {
      // Tentative de mouvement
      this.attemptMove(currentSelected, square);
    } else {
      // Sélectionner une nouvelle case
      const piece = this.chess.get(square as Square);
      if (piece && piece.color === this.chess.turn()) {
        this.selectedSquare.set(square);
        this.updatePossibleMoves();
      }
    }
  }

  private attemptMove(from: string, to: string): boolean {
    if (this.isMultiplayer) {
      // Mode multijoueur : valider le coup AVANT de l'émettre
      try {
        const tempChess = new Chess(this.chess.fen());
        const move = tempChess.move({
          from: from as Square,
          to: to as Square,
          promotion: 'q'
        });

        if (move) {
          this.moveChange.emit({
            from: move.from,
            to: move.to,
            promotion: move.promotion
          });
          this.selectedSquare.set(null);
          this.possibleMoves.set([]);
          return true;
        } else {
          this.handleInvalidMove(to);
          return false;
        }
      } catch (error) {
        this.selectedSquare.set(null);
        this.possibleMoves.set([]);
        return false;
      }
    } else {
      // Mode local : jouer le coup normalement
      try {
        const move = this.chess.move({
          from: from as Square,
          to: to as Square,
          promotion: 'q'
        });

        if (move) {
          this.lastMove.set({ from: move.from, to: move.to });
          this.moveChange.emit({
            from: move.from,
            to: move.to,
            promotion: move.promotion
          });
          this.updatePosition();
          this.selectedSquare.set(null);
          this.possibleMoves.set([]);
          return true;
        } else {
          this.handleInvalidMove(to);
          return false;
        }
      } catch (error) {
        this.handleInvalidMove(to);
        return false;
      }
    }
  }

  private handleInvalidMove(to: string) {
    // Mouvement invalide, essayer de sélectionner la case de destination
    const piece = this.chess.get(to as Square);
    if (piece && piece.color === this.chess.turn()) {
      this.selectedSquare.set(to);
      this.updatePossibleMoves();
    } else {
      this.selectedSquare.set(null);
      this.possibleMoves.set([]);
    }
  }

  private updatePossibleMoves() {
    const selected = this.selectedSquare();
    if (selected) {
      const moves = this.chess.moves({ square: selected as Square, verbose: true });
      this.possibleMoves.set(moves.map(move => move.to));
    } else {
      this.possibleMoves.set([]);
    }
  }

  private isSquareInCheck(square: string): boolean {
    if (!this.chess.isCheck()) return false;

    // Vérifier si c'est la case du roi en échec
    const piece = this.chess.get(square as Square);
    return piece?.type === 'k' && piece.color === this.chess.turn();
  }

  // Méthodes publiques
  updatePosition() {
    const newPosition = this.chess.fen();
    this.position.set(newPosition);
    this.positionChange.emit(newPosition);
  }

  resetGame() {
    this.chess.reset();
    this.updatePosition();
    this.selectedSquare.set(null);
    this.possibleMoves.set([]);
    this.lastMove.set(null);
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
    if (this.chess.isCheck()) {
      return `${this.getCurrentTurn()} is in check`;
    }
    return `${this.getCurrentTurn()} to move`;
  }

  // Méthodes d'accès publique pour drag & drop coordination
  public getSquareFromMouseCoordinates(clientX: number, clientY: number): string | null {
    return this.getSquareFromCoordinates(clientX, clientY);
  }

  // Délégation vers le service (compatibilité)
  getPieceSymbol(piece: any): string {
    return this.chessService.getPieceSymbol(piece);
  }

  isSquareSelected(square: string): boolean {
    return this.selectedSquare() === square;
  }
}

