import { Component, ViewChild } from '@angular/core';
import { EchiquierComponent } from './echiquier/echiquier.component';

@Component({
  selector: 'app-root',
  imports: [EchiquierComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'hotpawn';

  @ViewChild(EchiquierComponent) echiquierComponent!: EchiquierComponent;

  get gameStatus(): string {
    return this.echiquierComponent?.getGameStatus() || 'Tour des Blancs';
  }

  get position(): string {
    return this.echiquierComponent?.position() || 'Position initiale';
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

  resetGame(): void {
    this.echiquierComponent?.resetGame();
  }
}
