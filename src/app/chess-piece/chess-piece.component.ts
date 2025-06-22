import { Component, input, output, OnInit, OnDestroy, OnChanges, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChessService } from '../services/chess.service';

export interface ChessPiece {
    type: string;
    color: 'w' | 'b';
}

export interface PiecePosition {
    square: string;
    piece: ChessPiece;
    x: number;
    y: number;
    id: string; // ID unique pour le tracking DOM
}

@Component({
    selector: 'app-chess-piece',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div 
      #pieceElement
      class="chess-piece"
      [class.selected]="isSelected()"
      [class.dragging]="isDragging"
      [style.left.px]="currentX"
      [style.top.px]="currentY"
      [style.z-index]="isDragging ? 1000 : (isSelected() ? 100 : 10)"
      [attr.data-square]="position().square"
      [attr.data-piece-color]="position().piece.color"
      [attr.data-piece-type]="position().piece.type"
      [title]="getPieceAltText()"
      (mousedown)="onMouseDown($event)"
      (click)="onPieceClick($event)"
      (touchstart)="onTouchStart($event)"
    >
      <img 
        [src]="getPieceSymbol()" 
        [alt]="getPieceAltText()"
        class="piece-image"
        draggable="false"
      />
      @if (debugText()) {
        <div class="debug-text">{{ debugText() }}</div>
      }
    </div>
  `,
    styles: [`
    .chess-piece {
      position: absolute;
      width: var(--square-size, 60px);
      height: var(--square-size, 60px);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--piece-font-size, 48px);
      cursor: pointer;
      user-select: none;
      transition: transform 0.2s ease, box-shadow 0.15s ease, 
                  left 0.2s ease, top 0.2s ease;
      border-radius: 8px;
      transform-origin: center;
      pointer-events: auto;
      /* Améliorer l'interaction tactile */
      touch-action: none;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
    }

    /* Désactiver les transitions pendant le drag pour éviter les lags */
    .chess-piece.dragging {
      transition: none !important;
    }

    .piece-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
      pointer-events: none;
      user-select: none;
    }

    .debug-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: bold;
      font-family: monospace;
      white-space: nowrap;
      pointer-events: none;
      z-index: 1001;
    }

    .chess-piece:hover {
      transform: scale(1.05);
    }

    .chess-piece.selected {
      transform: scale(1.2);
    }

    .chess-piece.dragging {
      transform: scale(1.15);
      z-index: 1000;
      /* Transitions déjà désactivées par la règle précédente */
    }

    /* Styles spécifiques pour mobile */
    @media (max-width: 768px) {
      .chess-piece:hover {
        transform: none; /* Désactiver le hover sur mobile */
      }
      
      .chess-piece.selected {
        transform: scale(1.1); /* Réduction légère du scale sur mobile */
      }
      
      .chess-piece.dragging {
        transform: scale(1.1);
        /* Transitions déjà désactivées par la règle précédente */
      }
    }
  `]
})
export class ChessPieceComponent implements OnInit, OnDestroy, OnChanges {
    position = input.required<PiecePosition>();
    isSelected = input<boolean>(false);
    isDragEnabled = input<boolean>(true);
    boardOrientation = input<'white' | 'black'>('white');
    squareSize = input<number>(60);
    boardScale = input<number>(1);
    debugText = input<string>(''); // Texte de debug à afficher

    pieceClick = output<string>();
    dragStart = output<{ square: string, piece: ChessPiece }>();
    dragEnd = output<{ from: string, to: string, piece: ChessPiece }>();
    dragCancel = output<{ square: string, piece: ChessPiece }>();
    coordinateRequest = output<{ clientX: number, clientY: number, callback: (square: string | null) => void }>();

    @ViewChild('pieceElement', { static: true }) pieceElement!: ElementRef<HTMLElement>;

    // Position actuelle (peut différer de position.x/y pendant le drag)
    currentX: number = 0;
    currentY: number = 0;

    // État du drag
    isDragging: boolean = false;
    private hasMoved: boolean = false; // Pour différencier clic simple et drag
    private dragStartX: number = 0;
    private dragStartY: number = 0;
    private originalX: number = 0;
    private originalY: number = 0;

    // Event listeners pour le drag (souris et tactile)
    private mouseMoveListener?: (e: MouseEvent) => void;
    private mouseUpListener?: (e: MouseEvent) => void;
    private touchMoveListener?: (e: TouchEvent) => void;
    private touchEndListener?: (e: TouchEvent) => void;

    // Détecter le type d'interaction (souris ou tactile)
    private isTouch: boolean = false;

    constructor(private chessService: ChessService) { }

    ngOnInit() {
        this.currentX = this.position().x;
        this.currentY = this.position().y;
    }

    ngOnDestroy() {
        this.cleanupDragListeners();
    }

    ngOnChanges(changes: SimpleChanges) {
        // Mettre à jour la position si elle change (animation de mouvement)
        if (changes['position'] && !this.isDragging) {
            const oldPos = changes['position'].previousValue as PiecePosition;
            const newPos = changes['position'].currentValue as PiecePosition;

            // Ne repositionner que si la case a vraiment changé
            if (!oldPos || oldPos.square !== newPos.square) {
                this.animateToPosition(this.position().x, this.position().y);
            }
        }
    }

    onPieceClick(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();

        // Ignorer le clic s'il fait partie d'un drag (souris a bougé)
        if (this.hasMoved) {
            this.hasMoved = false; // Réinitialiser pour le prochain clic
            return;
        }

        // Permettre le clic même si isDragging = true, tant qu'on n'a pas bougé
        this.pieceClick.emit(this.position().square);
    }

    onMouseDown(event: MouseEvent) {
        if (!this.isDragEnabled() || this.isTouch) return; // Ignorer si on est en mode tactile

        event.preventDefault();
        event.stopPropagation();

        this.startDrag(event.clientX, event.clientY, false);
    }

    onTouchStart(event: TouchEvent) {
        if (!this.isDragEnabled()) return;

        event.preventDefault();
        event.stopPropagation();

        this.isTouch = true;
        const touch = event.touches[0];
        this.startDrag(touch.clientX, touch.clientY, true);
    }

    private startDrag(clientX: number, clientY: number, isTouch: boolean) {
        this.isDragging = true;
        this.hasMoved = false;
        this.isTouch = isTouch;
        this.originalX = this.currentX;
        this.originalY = this.currentY;
        this.dragStartX = clientX;
        this.dragStartY = clientY;

        this.setupDragListeners();
    }

    private setupDragListeners() {
        if (this.isTouch) {
            this.touchMoveListener = (e: TouchEvent) => this.onTouchMove(e);
            this.touchEndListener = (e: TouchEvent) => this.onTouchEnd(e);

            document.addEventListener('touchmove', this.touchMoveListener, { passive: false });
            document.addEventListener('touchend', this.touchEndListener);
            document.addEventListener('touchcancel', this.touchEndListener);
        } else {
            this.mouseMoveListener = (e: MouseEvent) => this.onMouseMove(e);
            this.mouseUpListener = (e: MouseEvent) => this.onMouseUp(e);

            document.addEventListener('mousemove', this.mouseMoveListener);
            document.addEventListener('mouseup', this.mouseUpListener);
        }
    }

    private cleanupDragListeners() {
        if (this.mouseMoveListener) {
            document.removeEventListener('mousemove', this.mouseMoveListener);
        }
        if (this.mouseUpListener) {
            document.removeEventListener('mouseup', this.mouseUpListener);
        }
        if (this.touchMoveListener) {
            document.removeEventListener('touchmove', this.touchMoveListener);
        }
        if (this.touchEndListener) {
            document.removeEventListener('touchend', this.touchEndListener);
            document.removeEventListener('touchcancel', this.touchEndListener);
        }
    }

    private onMouseMove(event: MouseEvent) {
        if (!this.isDragging || this.isTouch) return;
        this.handleMove(event.clientX, event.clientY);
    }

    private onTouchMove(event: TouchEvent) {
        if (!this.isDragging || !this.isTouch) return;

        event.preventDefault(); // Empêcher le scroll
        const touch = event.touches[0];
        this.handleMove(touch.clientX, touch.clientY);
    }

    private handleMove(clientX: number, clientY: number) {
        const deltaX = clientX - this.dragStartX;
        const deltaY = clientY - this.dragStartY;

        // Détecter le premier mouvement pour émettre dragStart et marquer hasMoved
        if (!this.hasMoved && (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)) {
            this.hasMoved = true;
            // Émettre dragStart seulement maintenant
            this.dragStart.emit({ square: this.position().square, piece: this.position().piece });
        }

        // Mettre à jour la position (en tenant compte du scaling)
        this.currentX = this.originalX + deltaX / this.boardScale();
        this.currentY = this.originalY + deltaY / this.boardScale();
    }

    private onMouseUp(event: MouseEvent) {
        if (!this.isDragging || this.isTouch) return;
        this.handleEnd(event.clientX, event.clientY);
    }

    private onTouchEnd(event: TouchEvent) {
        if (!this.isDragging || !this.isTouch) return;

        event.preventDefault();
        // Utiliser les coordonnées du dernier touch ou changedTouches
        const touch = event.changedTouches[0] || event.touches[0];
        if (touch) {
            this.handleEnd(touch.clientX, touch.clientY);
        } else {
            // Fallback si pas de coordonnées disponibles
            this.handleEnd(this.dragStartX, this.dragStartY);
        }
    }

    private handleEnd(clientX: number, clientY: number) {
        this.isDragging = false;
        this.isTouch = false;
        this.cleanupDragListeners();

        // Déterminer la case de destination via le parent
        this.coordinateRequest.emit({
            clientX: clientX,
            clientY: clientY,
            callback: (targetSquare: string | null) => {
                if (targetSquare && targetSquare !== this.position().square) {
                    // Émettre l'événement de fin de drag
                    this.dragEnd.emit({
                        from: this.position().square,
                        to: targetSquare,
                        piece: this.position().piece
                    });
                } else {
                    // Annuler le drag et revenir à la position originale
                    this.dragCancel.emit({ square: this.position().square, piece: this.position().piece });
                    this.animateToPosition(this.position().x, this.position().y);
                }
            }
        });
    }

    private getSquareFromCoordinates(clientX: number, clientY: number): string | null {
        // Cette méthode ne sera plus utilisée directement
        // La logique est maintenant gérée par le parent via coordinateRequest
        return null;
    }

    private animateToPosition(x: number, y: number) {
        this.currentX = x;
        this.currentY = y;
    }

    getPieceSymbol(): string {
        return this.chessService.getPieceSymbol(this.position().piece);
    }

    getPieceAltText(): string {
        const color = this.position().piece.color === 'w' ? 'Blanc' : 'Noir';
        const type = this.chessService.getPieceTypeName(this.position().piece.type);
        return `${color} ${type} sur ${this.position().square}`;
    }

    // Méthode publique pour déplacer la pièce programmatiquement
    public moveTo(x: number, y: number, animate: boolean = true) {
        if (animate) {
            this.animateToPosition(x, y);
        } else {
            this.currentX = x;
            this.currentY = y;
        }
    }

    // Méthode publique pour réinitialiser la position
    public resetPosition() {
        this.animateToPosition(this.position().x, this.position().y);
    }
} 