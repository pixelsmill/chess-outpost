import { Component, OnInit, ViewChild, ElementRef, signal, computed, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EchiquierComponent } from '../../echiquier/echiquier.component';
import { BoardWrapperComponent } from '../../board-wrapper/board-wrapper.component';
import { HeatmapBoardComponent } from '../../backgrounds/heatmap-board/heatmap-board.component';
import { TopographicBoardComponent } from '../../backgrounds/topographic-board/topographic-board.component';
import { ChessService } from '../../services/chess.service';
import { BoardDisplayService, BackgroundType } from '../../services/board-display.service';
import { Chess } from 'chess.js';

type AnalysisMode = 'free' | 'pgn';

@Component({
  selector: 'app-analyze',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    EchiquierComponent,
    BoardWrapperComponent,
    HeatmapBoardComponent,
    TopographicBoardComponent
  ],
  templateUrl: './analyze.component.html',
  styleUrls: ['../../styles/shared-layout.scss', './analyze.component.scss']
})
export class AnalyzeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(EchiquierComponent) echiquierComponent!: EchiquierComponent;
  @ViewChild('boardSection', { static: true }) boardSection!: ElementRef<HTMLElement>;

  // Signal pour le mode d'analyse (libre ou PGN)
  analysisMode = signal<AnalysisMode>('free');

  // Signal pour synchroniser la position
  currentPosition = signal('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

  // Gestion PGN et navigation (mode PGN)
  pgnText = '';
  gameHistory: string[] = [];
  currentMoveIndex = signal(-1);
  isNavigationMode = signal(false);

  // Instance Chess locale pour le chargement PGN
  private localChess = new Chess();

  // Computed properties
  isFreeMoveEnabled = computed(() => this.analysisMode() === 'free');
  isPgnMode = computed(() => this.analysisMode() === 'pgn');

  constructor(
    private chessService: ChessService,
    public boardDisplay: BoardDisplayService
  ) { }

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

  ngAfterViewInit() {
    this.boardDisplay.setupResizeObserver(this.boardSection);
  }

  ngOnDestroy() {
    this.boardDisplay.cleanup();
  }

  // === GESTION DES MODES ===

  setAnalysisMode(mode: AnalysisMode): void {
    this.analysisMode.set(mode);

    if (mode === 'free') {
      // Retour au mode libre : reset position et sortir du mode navigation
      this.isNavigationMode.set(false);
      this.currentPosition.set('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    }
    // Pour le mode PGN, on laisse l'interface de chargement apparaître
  }

  // === PROPRIÉTÉS POUR LE MODE LIBRE ===

  get gameStatus(): string {
    if (!this.isFreeMoveEnabled()) return '';
    return this.echiquierComponent?.getGameStatus() || 'Tour des Blancs';
  }

  get isGameOver(): boolean {
    if (!this.isFreeMoveEnabled()) return false;
    return this.echiquierComponent?.isGameOver() || false;
  }

  get isCheck(): boolean {
    if (!this.isFreeMoveEnabled()) return false;
    return this.echiquierComponent?.chess.isCheck() || false;
  }

  resetGame(): void {
    if (!this.isFreeMoveEnabled()) return;
    this.echiquierComponent?.resetGame();
    this.currentPosition.set('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  }

  // === PROPRIÉTÉS POUR LE MODE PGN ===

  get canGoBack(): boolean {
    return this.isPgnMode() && this.isNavigationMode() && this.currentMoveIndex() > -1;
  }

  get canGoForward(): boolean {
    return this.isPgnMode() && this.isNavigationMode() && this.currentMoveIndex() < this.gameHistory.length - 1;
  }

  // === GESTION COMMUNE ===

  onPositionChange(newPosition: string): void {
    // En mode PGN navigation, on ne met pas à jour la position depuis l'échiquier
    if (this.isPgnMode() && this.isNavigationMode()) {
      return;
    }
    this.currentPosition.set(newPosition);
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
    } else {
      alert('Erreur lors du chargement du PGN. Vérifiez le format.');
    }
  }

  newPgnAnalysis(): void {
    this.isNavigationMode.set(false);
    this.currentPosition.set('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  }

  // === NAVIGATION PGN ===

  goToStart(): void {
    if (!this.isPgnMode() || !this.isNavigationMode()) return;

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
    if (!this.isPgnMode() || !this.isNavigationMode()) return;

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
