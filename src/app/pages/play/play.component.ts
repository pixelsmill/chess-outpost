import { Component, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EchiquierComponent } from '../../echiquier/echiquier.component';
import { HeatmapComponent } from '../../heatmap/heatmap.component';
import { TopographicComponent } from '../../topographic/topographic.component';

@Component({
  selector: 'app-play',
  standalone: true,
  imports: [CommonModule, EchiquierComponent, HeatmapComponent, TopographicComponent],
  templateUrl: './play.component.html',
  styleUrl: './play.component.scss'
})
export class PlayComponent {
  @ViewChild(EchiquierComponent) echiquierComponent!: EchiquierComponent;

  // Signal pour synchroniser la position
  currentPosition = signal('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

  get gameStatus(): string {
    return this.echiquierComponent?.getGameStatus() || 'Tour des Blancs';
  }

  get isGameOver(): boolean {
    return this.echiquierComponent?.isGameOver() || false;
  }

  get isCheck(): boolean {
    return this.echiquierComponent?.chess.isCheck() || false;
  }

  onPositionChange(newPosition: string): void {
    this.currentPosition.set(newPosition);
  }

  resetGame(): void {
    this.echiquierComponent?.resetGame();
    this.currentPosition.set('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  }
}
