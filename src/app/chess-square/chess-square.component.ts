import { Component, input, output } from '@angular/core';
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
      [class.light-square]="squareData().isLight"
      [class.dark-square]="!squareData().isLight"
      [class.highlighted]="squareData().isHighlighted"
      [class.last-move]="squareData().isLastMove"
      [class.check]="squareData().isCheck"
      [class.possible-move]="squareData().isPossibleMove"
      [attr.data-square]="squareData().square"
      [attr.data-file]="squareData().file"
      [attr.data-rank]="squareData().rank"
      (click)="onSquareClick($event)"
    >
      <!-- Indicateur de mouvement possible -->
      @if (squareData().isPossibleMove) {
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
      border: 1px solid rgba(0, 0, 0, 0.1);
      box-sizing: border-box;
    }

    .light-square {
      background-color: transparent;
    }

    .dark-square {
      background-color: transparent;
    }

    .chess-square.highlighted {
      /* Pas d'effet visuel pour la sélection */
    }

    .chess-square.last-move {
      background-color: rgba(255, 224, 102, 0.2) !important;
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
      /* Pas de fond, seulement l'indicateur rond */
    }

    .move-indicator {
      position: absolute;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: var(--move-indicator-color, rgba(0, 0, 0, 0.3));
      pointer-events: none;
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
    squareData = input.required<ChessSquareData>();

    squareClick = output<string>();

    onSquareClick(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.squareClick.emit(this.squareData().square);
    }
} 