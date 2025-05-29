import { Component, ViewChild, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EchiquierComponent } from './echiquier/echiquier.component';
import { HeatmapComponent } from './heatmap/heatmap.component';
import { TopographicComponent } from './topographic/topographic.component';
import { ChessService, GameNavigation } from './services/chess.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, EchiquierComponent, HeatmapComponent, TopographicComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'hotpawn';

  @ViewChild(EchiquierComponent) echiquierComponent!: EchiquierComponent;

  // Signal pour synchroniser la position entre les deux composants
  currentPosition = signal('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

  // Gestion PGN et navigation
  pgnText = '';
  showPgnInput = false;
  gameHistory: string[] = [];
  currentMoveIndex = signal(-1);
  isNavigationMode = signal(false);

  constructor(private chessService: ChessService) { }

  get gameStatus(): string {
    return this.echiquierComponent?.getGameStatus() || 'Tour des Blancs';
  }

  get position(): string {
    return this.currentPosition();
  }

  get moveCount(): number {
    if (this.isNavigationMode()) {
      return this.currentMoveIndex() + 1;
    }
    return this.echiquierComponent?.chess.history().length || 0;
  }

  get totalMoves(): number {
    return this.gameHistory.length;
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

  get canGoBack(): boolean {
    return this.isNavigationMode() && this.currentMoveIndex() > -1;
  }

  get canGoForward(): boolean {
    return this.isNavigationMode() && this.currentMoveIndex() < this.gameHistory.length - 1;
  }

  onPositionChange(newPosition: string): void {
    if (!this.isNavigationMode()) {
      this.currentPosition.set(newPosition);
    }
  }

  resetGame(): void {
    this.echiquierComponent?.resetGame();
    this.isNavigationMode.set(false);
    this.currentMoveIndex.set(-1);
    this.gameHistory = [];
  }

  // === GESTION PGN ===

  togglePgnInput(): void {
    this.showPgnInput = !this.showPgnInput;

    // Pré-remplir avec la partie Immortelle si le textarea est vide
    if (this.showPgnInput && !this.pgnText.trim()) {
      this.pgnText = `[Event "London 'Immortal game'"]
[Site "London"]
[Date "1851.06.21"]
[Round "?"]
[White "Anderssen, Adolf"]
[Black "Kieseritzky, Lionel Adalbert BF"]
[Result "1-0"]
[ECO "C33"]
[PlyCount "45"]
[EventDate "1851.06.21"]
[EventType "game"]
[EventRounds "1"]
[EventCountry "ENG"]
[Source "ChessBase"]
[SourceDate "1999.07.01"]

e4 e5 2. f4 exf4 3. Bc4 Qh4+ 4. Kf1 b5 5. Bxb5 Nf6 6. Nf3 Qh6 7. d3 Nh5 8.
Nh4 Qg5 9. Nf5 c6 10. g4 Nf6 11. Rg1 cxb5 12. h4 Qg6 13. h5 Qg5 14. Qf3 Ng8 15.
Bxf4 Qf6 16. Nc3 Bc5 17. Nd5 Qxb2 18. Bd6 Bxg1 19. e5 Qxa1+ 20. Ke2 Na6 21.
Nxg7+ Kd8 22. Qf6+ Nxf6 23. Be7# 1-0`;
    }
  }

  loadPgn(): void {
    if (!this.pgnText.trim()) {
      alert('Veuillez entrer un PGN valide');
      return;
    }

    const chess = this.echiquierComponent.chess;
    const success = this.chessService.loadPgnIntoChess(chess, this.pgnText);

    if (success) {
      // Sauvegarder l'historique complet
      this.gameHistory = chess.history();

      // Revenir au début de la partie
      this.goToStart();

      // Activer le mode navigation
      this.isNavigationMode.set(true);

      // Masquer l'input PGN
      this.showPgnInput = false;

      alert('PGN chargé avec succès!');
    } else {
      alert('Erreur lors du chargement du PGN. Vérifiez le format.');
    }
  }

  // === NAVIGATION ===

  goToStart(): void {
    if (!this.isNavigationMode()) return;

    const chess = this.echiquierComponent.chess;
    chess.reset();
    this.currentMoveIndex.set(-1);
    this.currentPosition.set(chess.fen());
  }

  goToPrevious(): void {
    if (!this.canGoBack) return;

    const newIndex = this.currentMoveIndex() - 1;
    this.goToMoveIndex(newIndex);
  }

  goToNext(): void {
    if (!this.canGoForward) return;

    const newIndex = this.currentMoveIndex() + 1;
    this.goToMoveIndex(newIndex);
  }

  goToEnd(): void {
    if (!this.isNavigationMode()) return;

    this.goToMoveIndex(this.gameHistory.length - 1);
  }

  private goToMoveIndex(moveIndex: number): void {
    if (moveIndex < -1 || moveIndex >= this.gameHistory.length) return;

    const chess = this.echiquierComponent.chess;
    chess.reset();

    // Rejouer les coups jusqu'à l'index voulu
    for (let i = 0; i <= moveIndex; i++) {
      try {
        chess.move(this.gameHistory[i]);
      } catch (error) {
        console.error('Erreur lors de la navigation:', error);
        return;
      }
    }

    this.currentMoveIndex.set(moveIndex);
    this.currentPosition.set(chess.fen());
  }

  getCurrentMoveDisplay(): string {
    if (!this.isNavigationMode()) {
      return `Coup ${this.moveCount}`;
    }

    const current = this.currentMoveIndex() + 1;
    const total = this.gameHistory.length;

    if (current === 0) {
      return `Position initiale (0/${total})`;
    }

    return `Coup ${current}/${total}`;
  }
}
