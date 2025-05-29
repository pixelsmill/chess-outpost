import { Component, ViewChild, signal } from '@angular/core';
import { EchiquierComponent } from './echiquier/echiquier.component';
import { HeatmapComponent } from './heatmap/heatmap.component';

@Component({
  selector: 'app-root',
  imports: [EchiquierComponent, HeatmapComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'hotpawn';

  @ViewChild(EchiquierComponent) echiquierComponent!: EchiquierComponent;

  // Signal pour synchroniser la position entre les deux composants
  currentPosition = signal('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

  get gameStatus(): string {
    return this.echiquierComponent?.getGameStatus() || 'Tour des Blancs';
  }

  get position(): string {
    return this.currentPosition();
  }

  get moveCount(): number {
    return this.echiquierComponent?.chess.history().length || 0;
  }

  get selectedSquare(): string | null {
    return this.echiquierComponent?.selectedSquare() || null;
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
  }
}
