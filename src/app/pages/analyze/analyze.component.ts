import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EchiquierComponent } from '../../echiquier/echiquier.component';
import { BoardWrapperComponent } from '../../board-wrapper/board-wrapper.component';
import { ClassicBoardComponent } from '../../backgrounds/classic-board/classic-board.component';
import { HeatmapBoardComponent } from '../../backgrounds/heatmap-board/heatmap-board.component';
import { TopographicBoardComponent } from '../../backgrounds/topographic-board/topographic-board.component';
import { ChessService } from '../../services/chess.service';
import { Chess } from 'chess.js';

type BackgroundType = 'classic' | 'heatmap' | 'topographic';

@Component({
  selector: 'app-analyze',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    EchiquierComponent,
    BoardWrapperComponent,
    ClassicBoardComponent,
    HeatmapBoardComponent,
    TopographicBoardComponent
  ],
  templateUrl: './analyze.component.html',
  styleUrl: './analyze.component.scss'
})
export class AnalyzeComponent implements OnInit {

  // Signal pour synchroniser la position
  currentPosition = signal('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

  // Signal pour le background sélectionné (comme dans play)
  selectedBackground = signal<BackgroundType>('classic');

  // Gestion PGN et navigation
  pgnText = '';
  showPgnInput = signal(true);
  gameHistory: string[] = [];
  currentMoveIndex = signal(-1);
  isNavigationMode = signal(false);

  // Instance Chess locale pour le chargement PGN
  private localChess = new Chess();

  constructor(private chessService: ChessService) { }

  ngOnInit() {
    // Pré-remplir avec la partie Immortelle
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

  get canGoBack(): boolean {
    return this.isNavigationMode() && this.currentMoveIndex() > -1;
  }

  get canGoForward(): boolean {
    return this.isNavigationMode() && this.currentMoveIndex() < this.gameHistory.length - 1;
  }

  // Nouvelle méthode pour changer de background
  setBackground(background: BackgroundType): void {
    this.selectedBackground.set(background);
  }

  onPositionChange(newPosition: string): void {
    // En mode navigation, on ne met pas à jour la position depuis l'échiquier
    if (!this.isNavigationMode()) {
      this.currentPosition.set(newPosition);
    }
  }

  // === GESTION PGN ===

  loadPgn(): void {
    if (!this.pgnText.trim()) {
      alert('Veuillez entrer un PGN valide');
      return;
    }

    const success = this.chessService.loadPgnIntoChess(this.localChess, this.pgnText);

    if (success) {
      this.gameHistory = this.localChess.history();
      this.goToStart();
      this.isNavigationMode.set(true);
      this.showPgnInput.set(false);
    } else {
      alert('Erreur lors du chargement du PGN. Vérifiez le format.');
    }
  }

  // === NAVIGATION ===

  goToStart(): void {
    if (!this.isNavigationMode()) return;

    this.localChess.reset();
    this.currentMoveIndex.set(-1);
    this.currentPosition.set(this.localChess.fen());
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

    this.localChess.reset();

    // Rejouer les coups jusqu'à l'index voulu
    for (let i = 0; i <= moveIndex; i++) {
      try {
        this.localChess.move(this.gameHistory[i]);
      } catch (error) {
        console.error('Erreur lors de la navigation:', error);
        return;
      }
    }

    this.currentMoveIndex.set(moveIndex);
    this.currentPosition.set(this.localChess.fen());
  }

  getCurrentMoveDisplay(): string {
    const current = this.currentMoveIndex() + 1;
    const total = this.gameHistory.length;

    if (current === 0) {
      return `Position initiale (0/${total})`;
    }

    return `Coup ${current}/${total}`;
  }
}
