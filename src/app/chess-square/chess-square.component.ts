import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ChessSquareData {
    square: string;
    rank: number;
    file: number;
    isLight: boolean;
    isHighlighted?: boolean;
    isLastMove?: boolean;
    isCheck?: boolean;
    isPossibleMove?: boolean;
}

@Component({
    selector: 'app-chess-square',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div 
      class="chess-square"
      [class.light-square]="squareData.isLight"
      [class.dark-square]="!squareData.isLight"
      [class.highlighted]="squareData.isHighlighted"
      [class.last-move]="squareData.isLastMove"
      [class.check]="squareData.isCheck"
      [class.possible-move]="squareData.isPossibleMove"
      [attr.data-square]="squareData.square"
      [attr.data-file]="squareData.file"
      [attr.data-rank]="squareData.rank"
      (click)="onSquareClick($event)"
    >
      <!-- Coordonnées optionnelles -->
      @if (showCoordinates && shouldShowFileLabel()) {
        <div class="file-label">{{ getFileLabel() }}</div>
      }
      @if (showCoordinates && shouldShowRankLabel()) {
        <div class="rank-label">{{ getRankLabel() }}</div>
      }
      
      <!-- Indicateur de mouvement possible -->
      @if (squareData.isPossibleMove) {
        <div class="move-indicator"></div>
      }
    </div>
  `,
    styles: [`
    .chess-square {
      position: relative;
      width: var(--square-size, 60px);
      height: var(--square-size, 60px);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      user-select: none;
      transition: background-color 0.15s ease, box-shadow 0.15s ease;
    }

    .light-square {
      background-color: var(--light-square-color, #f0d9b5);
    }

    .dark-square {
      background-color: var(--dark-square-color, #b58863);
    }

    .chess-square.highlighted {
      background-color: var(--highlight-color, #ffffcc) !important;
      box-shadow: inset 0 0 0 3px var(--highlight-border-color, #ffff00);
    }

    .chess-square.last-move {
      background-color: var(--last-move-color, #ffe066) !important;
      box-shadow: inset 0 0 0 2px var(--last-move-border-color, #ffd700);
    }

    .chess-square.check {
      background-color: var(--check-color, #ff6b6b) !important;
      box-shadow: inset 0 0 0 3px var(--check-border-color, #ff0000);
      animation: check-pulse 1s infinite alternate;
    }

    @keyframes check-pulse {
      0% { box-shadow: inset 0 0 0 3px var(--check-border-color, #ff0000); }
      100% { box-shadow: inset 0 0 0 5px var(--check-border-color, #ff0000); }
    }

    .chess-square.possible-move {
      background-color: var(--possible-move-bg, rgba(0, 255, 0, 0.2));
    }

    .move-indicator {
      position: absolute;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: var(--move-indicator-color, rgba(0, 0, 0, 0.3));
      pointer-events: none;
    }

    .file-label, .rank-label {
      position: absolute;
      font-size: 12px;
      font-weight: bold;
      color: var(--coordinate-color, #333);
      pointer-events: none;
      z-index: 5;
    }

    .file-label {
      bottom: 2px;
      right: 2px;
    }

    .rank-label {
      top: 2px;
      left: 2px;
    }

    /* Hover effect */
    .chess-square:hover {
      background-color: var(--hover-color, rgba(255, 255, 255, 0.1));
      box-shadow: inset 0 0 0 2px var(--hover-border-color, rgba(255, 255, 255, 0.3));
    }

    /* Active effect pour feedback tactile */
    .chess-square:active {
      transform: scale(0.98);
    }
  `]
})
export class ChessSquareComponent {
    @Input() squareData!: ChessSquareData;
    @Input() showCoordinates: boolean = true;
    @Input() boardOrientation: 'white' | 'black' = 'white';

    @Output() squareClick = new EventEmitter<string>();

    onSquareClick(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.squareClick.emit(this.squareData.square);
    }

    shouldShowFileLabel(): boolean {
        // Afficher les lettres de colonne sur la dernière rangée
        return this.boardOrientation === 'white'
            ? this.squareData.rank === 1
            : this.squareData.rank === 8;
    }

    shouldShowRankLabel(): boolean {
        // Afficher les chiffres de rangée sur la première colonne
        return this.boardOrientation === 'white'
            ? this.squareData.file === 1
            : this.squareData.file === 8;
    }

    getFileLabel(): string {
        return String.fromCharCode(96 + this.squareData.file); // a, b, c, ...
    }

    getRankLabel(): string {
        return this.squareData.rank.toString();
    }
} 