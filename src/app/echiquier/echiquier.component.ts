import { Component, OnInit, OnChanges, SimpleChanges, input, output, signal, computed, ViewChild, ElementRef, QueryList, ViewChildren, effect, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chess, Square } from 'chess.js';
import { ChessService } from '../services/chess.service';
import { ChessSquareComponent, ChessSquareData } from '../chess-square/chess-square.component';
import { ChessPieceComponent, PiecePosition, ChessPiece } from '../chess-piece/chess-piece.component';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-echiquier',
  standalone: true,
  imports: [CommonModule, ChessSquareComponent, ChessPieceComponent],
  templateUrl: './echiquier.component.html',
  styleUrl: './echiquier.component.scss'
})
export class EchiquierComponent implements OnInit, OnChanges {
  externalPosition = input<string | undefined>(undefined); // Position venant du parent (navigation PGN)
  disableClicks = input<boolean>(false); // Désactiver les clics pendant la navigation
  isMultiplayer = input<boolean>(false); // Mode multijoueur - ne pas jouer localement
  orientation = input<'white' | 'black'>('white'); // Orientation de l'échiquier
  enableDragDrop = input<boolean>(true); // Activer le drag & drop
  showCoordinates = input<boolean>(true); // Afficher les coordonnées
  squareSize = input<number>(60); // Taille des cases en pixels
  boardScale = input<number>(1); // Échelle appliquée à tout l'échiquier

  ref = inject(ChangeDetectorRef);

  @ViewChild('boardContainer', { static: true }) boardContainer!: ElementRef<HTMLElement>;
  @ViewChildren(ChessPieceComponent) pieceComponents!: QueryList<ChessPieceComponent>;

  chess = new Chess();

  // Signaux pour la réactivité
  position = signal(this.chess.fen());
  selectedSquare = signal<string | null>(null);
  possibleMoves = signal<string[]>([]);
  lastMove = signal<{ from: string, to: string } | null>(null);
  orientationChange = signal(0); // Signal pour forcer le recalcul quand l'orientation change
  pieces = signal<PiecePosition[]>([]);

  // Événements
  positionChange = output<string>();
  moveChange = output<{ from: string, to: string, promotion?: string }>();

  constructor(private chessService: ChessService) {
    // Écouter les changements d'orientation avec debounce pour éviter les appels répétés
    toObservable(this.orientation)
      .pipe(
        takeUntilDestroyed() // Cleanup automatique à la destruction du composant
      ).subscribe(() => {
        console.log('orientation changed');
        this.updatePieces();
      });
  }

  ngOnInit() {
    this.orientationChange.set(1); // Déclencher le calcul initial avec l'orientation
    this.updatePosition();
    this.updatePossibleMoves();
    this.updatePieces(); // Initialiser les pièces
  }

  ngOnChanges(changes: SimpleChanges) {
    // Synchroniser avec la position externe (navigation PGN)
    if (changes['externalPosition'] && this.externalPosition()) {
      try {
        this.chess.load(this.externalPosition()!);
        this.position.set(this.externalPosition()!);
        this.selectedSquare.set(null);
        this.possibleMoves.set([]);
        this.updatePieces(); // Mettre à jour les pièces quand position externe change
      } catch (error) {
        console.error('Erreur lors du chargement de la position externe:', error);
      }
    }

  }

  // Calculer les coordonnées pixel d'une case avec orientation spécifique
  private getSquareCoordinatesWithOrientation(square: string, orientation: 'white' | 'black'): { x: number, y: number } {
    const file = square.charCodeAt(0) - 97; // a=0, b=1, etc.
    const rank = parseInt(square[1]) - 1;    // 1=0, 2=1, etc.

    let x, y;

    if (orientation === 'white') {
      x = file * this.squareSize();
      y = (7 - rank) * this.squareSize();
    } else {
      x = (7 - file) * this.squareSize();
      y = rank * this.squareSize();
    }

    return { x, y };
  }

  // Calculer les coordonnées pixel d'une case (utilise l'orientation courante)
  private getSquareCoordinates(square: string): { x: number, y: number } {
    return this.getSquareCoordinatesWithOrientation(square, this.orientation());
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
    const scaledSquareSize = this.squareSize() * this.boardScale();
    const file = Math.floor(relativeX / scaledSquareSize);
    const rank = Math.floor(relativeY / scaledSquareSize);

    let square: string;

    if (this.orientation() === 'white') {
      square = String.fromCharCode(97 + file) + (8 - rank);
    } else {
      square = String.fromCharCode(97 + (7 - file)) + (rank + 1);
    }

    return square;
  }

  // Gestionnaires d'événements
  onSquareClick(square: string) {
    if (this.disableClicks()) {
      return;
    }

    this.handleSquareSelection(square);
  }

  onPieceClick(square: string) {
    if (this.disableClicks()) {
      return;
    }

    this.handleSquareSelection(square);
  }

  onDragStart(event: { square: string, piece: ChessPiece }) {
    if (this.disableClicks()) return;

    // Vérifier que c'est bien le tour du joueur
    if (event.piece.color !== this.chess.turn()) {
      return;
    }

    // Sélectionner la pièce qui commence le drag
    this.selectedSquare.set(event.square);
    this.updatePossibleMoves();
  }

  onDragEnd(event: { from: string, to: string, piece: ChessPiece }) {
    if (this.disableClicks()) return;

    // Tenter le mouvement et capturer le résultat
    const moveSuccessful = this.attemptMove(event.from, event.to);

    if (!moveSuccessful) {
      // Si le mouvement a échoué, forcer le repositionnement de la pièce
      const pieceComponent = this.pieceComponents.find(p => p.position().square === event.from);
      if (pieceComponent) {
        pieceComponent.resetPosition();
      }
    }
  }

  onDragCancel(event: { square: string, piece: ChessPiece }) {
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
    if (this.isMultiplayer()) {
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
    this.updatePieces(); // Mettre à jour les pièces quand la position change
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

  // Fonction trackBy pour *ngFor des pièces
  trackPiece(index: number, piece: PiecePosition): string {
    return piece.id;
  }

  // Données des cases de l'échiquier (statiques)
  getSquares(): ChessSquareData[] {
    this.orientationChange(); // Assurer la réactivité
    const squares: ChessSquareData[] = [];
    const currentOrientation = this.orientation();

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

    if (currentOrientation === 'white') {
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
  }

  // Générer un ID aléatoire de 8 caractères a-z
  private generateRandomId(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Fonction pour calculer les IDs avec ordre stable - version optimisée
  private computeIds(oldPieces: PiecePosition[], newPieces: PiecePosition[]): PiecePosition[] {
    const usedIds = new Set<string>();
    const finalResult: PiecePosition[] = [];

    // 1. CONSERVER L'ORDRE: Commencer par les anciennes pièces dans leur ordre original
    for (const oldPiece of oldPieces) {
      // Chercher si cette pièce existe encore (même case + même type)
      const stillExists = newPieces.find(newP =>
        newP.square === oldPiece.square &&
        newP.piece.type === oldPiece.piece.type &&
        newP.piece.color === oldPiece.piece.color
      );

      if (stillExists) {
        // Conserver la pièce avec son ID original mais les nouvelles coordonnées
        finalResult.push({
          ...stillExists,
          id: oldPiece.id
        });
        usedIds.add(oldPiece.id);
      }
    }

    // 2. RÉASSIGNER LES IDS: Pour les pièces qui ont bougé, essayer de garder leur ID original
    const remainingNewPieces = newPieces.filter(newP =>
      !finalResult.some(existing =>
        existing.square === newP.square &&
        existing.piece.type === newP.piece.type &&
        existing.piece.color === newP.piece.color
      )
    );

    // D'abord essayer de trouver la pièce d'origine (qui a bougé)
    for (const newPiece of remainingNewPieces) {
      // Chercher si c'est une pièce qui a juste bougé (même type + couleur)
      const movedFromOld = oldPieces.find(oldP =>
        oldP.piece.type === newPiece.piece.type &&
        oldP.piece.color === newPiece.piece.color &&
        oldP.square !== newPiece.square && // Case différente = mouvement
        !usedIds.has(oldP.id) // ID pas encore utilisé
      );

      if (movedFromOld) {
        finalResult.push({
          ...newPiece,
          id: movedFromOld.id
        });
        usedIds.add(movedFromOld.id);
      }
    }

    // 3. Pour les vraies nouvelles pièces, utiliser les IDs restants
    const stillRemainingPieces = remainingNewPieces.filter(newP =>
      !finalResult.some(existing =>
        existing.square === newP.square &&
        existing.piece.type === newP.piece.type &&
        existing.piece.color === newP.piece.color
      )
    );

    const availableIds = oldPieces
      .filter(oldP => !usedIds.has(oldP.id))
      .map(oldP => oldP.id);

    for (let i = 0; i < stillRemainingPieces.length; i++) {
      const newPiece = stillRemainingPieces[i];

      if (i < availableIds.length) {
        // Réutiliser un ID existant
        finalResult.push({
          ...newPiece,
          id: availableIds[i]
        });
        usedIds.add(availableIds[i]);
      } else {
        // Créer un nouvel ID
        let pieceId: string;
        do {
          pieceId = this.generateRandomId();
        } while (usedIds.has(pieceId));

        finalResult.push({
          ...newPiece,
          id: pieceId
        });
        usedIds.add(pieceId);
      }
    }

    return finalResult;
  }

  // Positions des pièces (dynamiques)
  updatePieces(): void {
    const currentOrientation = this.orientation();

    // Générer le nouvel état (sans IDs intelligents pour l'instant)
    const newPieces: PiecePosition[] = [];
    for (let rank = 1; rank <= 8; rank++) {
      for (let file = 1; file <= 8; file++) {
        const square = String.fromCharCode(96 + file) + rank;
        const piece = this.chess.get(square as Square);

        if (piece) {
          const { x, y } = this.getSquareCoordinatesWithOrientation(square, currentOrientation);
          newPieces.push({
            square,
            piece: {
              type: piece.type,
              color: piece.color
            },
            x,
            y,
            id: ''
          });
        }
      }
    }

    // Vérifier si c'est un changement d'orientation (flip board)
    const oldPieces = this.pieces();
    const isOrientationChange = oldPieces.length > 0 && newPieces.length > 0 &&
      oldPieces.some(oldP => {
        const newP = newPieces.find(newPiece =>
          newPiece.square === oldP.square &&
          newPiece.piece.type === oldP.piece.type &&
          newPiece.piece.color === oldP.piece.color
        );
        return newP && (newP.x !== oldP.x || newP.y !== oldP.y);
      });

    let piecesWithSmartIds: PiecePosition[];

    if (isOrientationChange) {
      // Pour un flip board, forcer de nouveaux IDs pour déclencher les transitions
      piecesWithSmartIds = newPieces.map(piece => ({
        ...piece,
        id: this.generateRandomId()
      }));
    } else {
      // Comportement normal avec IDs intelligents
      piecesWithSmartIds = this.computeIds(oldPieces, newPieces);
    }

    this.pieces.set(piecesWithSmartIds);
  }
}

