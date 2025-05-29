import { Component, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EchiquierComponent } from '../../echiquier/echiquier.component';
import { BoardWrapperComponent } from '../../board-wrapper/board-wrapper.component';
import { ClassicBoardComponent } from '../../backgrounds/classic-board/classic-board.component';
import { HeatmapBoardComponent } from '../../backgrounds/heatmap-board/heatmap-board.component';
import { TopographicBoardComponent } from '../../backgrounds/topographic-board/topographic-board.component';

type BackgroundType = 'classic' | 'heatmap' | 'topographic';

@Component({
  selector: 'app-play',
  standalone: true,
  imports: [
    CommonModule,
    EchiquierComponent,
    BoardWrapperComponent,
    ClassicBoardComponent,
    HeatmapBoardComponent,
    TopographicBoardComponent
  ],
  templateUrl: './play.component.html',
  styleUrl: './play.component.scss'
})
export class PlayComponent {
  @ViewChild(EchiquierComponent) echiquierComponent!: EchiquierComponent;

  // Signal pour synchroniser la position
  currentPosition = signal('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

  // Signal pour le background sélectionné
  selectedBackground = signal<BackgroundType>('classic');

  get gameStatus(): string {
    return this.echiquierComponent?.getGameStatus() || 'Tour des Blancs';
  }

  get isGameOver(): boolean {
    return this.echiquierComponent?.isGameOver() || false;
  }

  get isCheck(): boolean {
    return this.echiquierComponent?.chess.isCheck() || false;
  }

  setBackground(background: BackgroundType): void {
    this.selectedBackground.set(background);
  }

  onPositionChange(newPosition: string): void {
    this.currentPosition.set(newPosition);
  }

  resetGame(): void {
    this.echiquierComponent?.resetGame();
    this.currentPosition.set('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  }
}
