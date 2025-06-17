import { Component, OnInit, ViewChild, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ChessBoardWithControlsComponent } from '../../shared/chess-board-with-controls/chess-board-with-controls.component';
import { ChessService } from '../../services/chess.service';
import { GameNavigationService } from '../../services/game-navigation.service';
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
    ChessBoardWithControlsComponent
  ],
  templateUrl: './analyze.component.html',
  styleUrls: ['../../styles/shared-layout.scss', './analyze.component.scss']
})
export class AnalyzeComponent implements OnInit {
  @ViewChild('chessBoardWithControls') chessBoardWithControls!: ChessBoardWithControlsComponent;

  // Signal pour le mode d'analyse (libre ou PGN)
  analysisMode = signal<AnalysisMode>('free');

  // Gestion PGN (mode PGN seulement)
  pgnText = '';
  isNavigationMode = signal(false);

  // Instance Chess locale pour le chargement PGN et le mode libre
  private localChess = new Chess();

  // Computed properties
  isFreeMoveEnabled = computed(() => this.analysisMode() === 'free');
  isPgnMode = computed(() => this.analysisMode() === 'pgn');

  constructor(
    private chessService: ChessService,
    public boardDisplay: BoardDisplayService,
    public gameNavigationService: GameNavigationService
  ) { }

  ngOnInit() {
    // Initialiser l'historique vide pour le mode libre
    this.gameNavigationService.initializeHistory();

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

  // === GESTION DES MODES ===

  setAnalysisMode(mode: AnalysisMode): void {
    this.analysisMode.set(mode);

    if (mode === 'free') {
      // Retour au mode libre : reset position et historique
      this.isNavigationMode.set(false);
      this.resetToStartingPosition();
    }
    // Pour le mode PGN, on laisse l'interface de chargement apparaître
  }

  private resetToStartingPosition(): void {
    this.localChess.reset();
    this.gameNavigationService.reset();
  }

  // === PROPRIÉTÉS POUR LE MODE LIBRE ===

  get gameStatus(): string {
    if (!this.isFreeMoveEnabled()) return '';
    return this.chessBoardWithControls?.gameStatus || '';
  }

  get isGameOver(): boolean {
    if (!this.isFreeMoveEnabled()) return false;
    return this.chessBoardWithControls?.isGameOver || false;
  }

  get isCheck(): boolean {
    if (!this.isFreeMoveEnabled()) return false;
    return this.chessBoardWithControls?.isCheck || false;
  }

  resetGame(): void {
    if (!this.isFreeMoveEnabled()) return;
    if (this.chessBoardWithControls) {
      this.chessBoardWithControls.resetGame();
    }
    // Réinitialiser l'historique centralisé
    this.resetToStartingPosition();
  }

  // === PROPRIÉTÉS POUR LA NAVIGATION (UNIFIÉES) ===

  get canGoBack(): boolean {
    return this.gameNavigationService.canGoBack();
  }

  get canGoForward(): boolean {
    return this.gameNavigationService.canGoForward();
  }

  get canNavigate(): boolean {
    return this.gameNavigationService.canNavigate();
  }

  get currentPosition(): string {
    return this.gameNavigationService.currentPosition();
  }

  // === GESTION DES COUPS (MODE LIBRE) ===

  onMoveChange(move: { from: string; to: string; promotion?: string }): void {
    if (!this.isFreeMoveEnabled() || this.gameNavigationService.isCurrentlyNavigating()) return;

    // Synchroniser this.localChess avec la position actuelle de navigation
    const currentPosition = this.gameNavigationService.currentPosition();
    this.localChess.load(currentPosition);

    // Faire le coup sur l'échiquier local pour capturer les informations
    try {
      const moveResult = this.localChess.move(move);
      if (moveResult) {
        // Ajouter le coup à l'historique centralisé via le service
        this.gameNavigationService.addMove({
          san: moveResult.san,
          from: moveResult.from,
          to: moveResult.to,
          fen: this.localChess.fen()
        });
      }
    } catch (error) {
      console.error('Error adding move to history:', error);
    }
  }

  // === GESTION COMMUNE ===

  onPositionChange(newPosition: string): void {
    // En mode navigation (PGN ou historique), on ne met pas à jour la position depuis l'échiquier
    if ((this.isPgnMode() && this.isNavigationMode()) || this.gameNavigationService.isCurrentlyNavigating()) {
      return;
    }
    // En mode libre, la position est gérée par le service via onMoveChange
  }

  // === GESTION PGN ===

  loadPgn(): void {
    if (!this.pgnText.trim()) {
      alert('Please enter a valid PGN');
      return;
    }

    const success = this.chessService.loadPgnIntoChess(this.localChess, this.pgnText);

    if (success) {
      // Convertir l'historique PGN en GameHistory centralisé via le service
      const moves = this.localChess.history();
      const pgnMoves = moves.map(san => ({ san }));
      this.gameNavigationService.loadFromMoves(pgnMoves);

      this.goToStart();
      this.isNavigationMode.set(true);
    } else {
      alert('Error loading PGN. Please check the format.');
    }
  }

  newPgnAnalysis(): void {
    this.isNavigationMode.set(false);
    this.resetToStartingPosition();
  }

  // === NAVIGATION UNIFIÉE (PGN ET MODE LIBRE) ===

  goToStart(): void {
    this.gameNavigationService.goToStart();
  }

  goToPrevious(): void {
    this.gameNavigationService.goToPrevious();
  }

  goToNext(): void {
    this.gameNavigationService.goToNext();
  }

  goToEnd(): void {
    this.gameNavigationService.goToEnd();
  }

  getCurrentMoveDisplay(): string {
    return this.gameNavigationService.getCurrentMoveDisplay();
  }

  get currentMove(): number {
    return this.gameNavigationService.currentMove();
  }

  get totalMoves(): number {
    return this.gameNavigationService.totalMoves();
  }
}
