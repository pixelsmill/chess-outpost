import { Component, OnInit, ViewChild, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ChessBoardWithControlsComponent } from '../../shared/chess-board-with-controls/chess-board-with-controls.component';
import { ChessService, GameHistory, GameNavigation } from '../../services/chess.service';
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

  // Signal pour synchroniser la position
  currentPosition = signal('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

  // Historique centralisé et navigation (pour les deux modes)
  gameHistory: GameHistory | null = null;
  gameNavigation: GameNavigation = { currentMove: 0, totalMoves: 0, canGoBack: false, canGoForward: false };

  // Gestion PGN (mode PGN seulement)
  pgnText = '';
  isNavigationMode = signal(false);

  // Instance Chess locale pour le chargement PGN et le mode libre
  private localChess = new Chess();

  // Flag pour éviter les boucles lors de la navigation
  private isNavigatingHistory = false;

  // Computed properties
  isFreeMoveEnabled = computed(() => this.analysisMode() === 'free');
  isPgnMode = computed(() => this.analysisMode() === 'pgn');

  constructor(
    private chessService: ChessService,
    public boardDisplay: BoardDisplayService
  ) { }

  ngOnInit() {
    // Initialiser l'historique vide pour le mode libre
    this.gameHistory = this.chessService.createGameHistory();
    this.gameNavigation = this.chessService.getGameNavigationFromHistory(this.gameHistory);

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
    this.gameHistory = this.chessService.createGameHistory();
    this.gameNavigation = this.chessService.getGameNavigationFromHistory(this.gameHistory);
    this.currentPosition.set('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
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
    return this.gameNavigation.canGoBack;
  }

  get canGoForward(): boolean {
    return this.gameNavigation.canGoForward;
  }

  get canNavigate(): boolean {
    return this.gameHistory !== null && this.gameHistory.moves.length > 0;
  }

  // === GESTION DES COUPS (MODE LIBRE) ===

  onMoveChange(move: { from: string; to: string; promotion?: string }): void {
    if (!this.isFreeMoveEnabled() || this.isNavigatingHistory) return;

    // Faire le coup sur l'échiquier local pour capturer les informations
    try {
      const moveResult = this.localChess.move(move);
      if (moveResult && this.gameHistory) {
        // Ajouter le coup à l'historique centralisé
        this.gameHistory = this.chessService.addMoveToHistory(this.gameHistory, {
          san: moveResult.san,
          from: moveResult.from,
          to: moveResult.to,
          fen: this.localChess.fen()
        });

        // Mettre à jour la navigation
        this.gameNavigation = this.chessService.getGameNavigationFromHistory(this.gameHistory);

        console.log('🎯 Move added to history:', {
          san: moveResult.san,
          totalMoves: this.gameHistory.moves.length
        });
      }
    } catch (error) {
      console.error('Error adding move to history:', error);
    }
  }

  // === GESTION COMMUNE ===

  onPositionChange(newPosition: string): void {
    // En mode navigation (PGN ou historique), on ne met pas à jour la position depuis l'échiquier
    if ((this.isPgnMode() && this.isNavigationMode()) || this.isNavigatingHistory) {
      return;
    }
    this.currentPosition.set(newPosition);
  }

  // === GESTION PGN ===

  loadPgn(): void {
    if (!this.pgnText.trim()) {
      alert('Please enter a valid PGN');
      return;
    }

    const success = this.chessService.loadPgnIntoChess(this.localChess, this.pgnText);

    if (success) {
      // Convertir l'historique PGN en GameHistory centralisé
      const moves = this.localChess.history();
      const pgnMoves = moves.map(san => ({ san }));
      this.gameHistory = this.chessService.convertMovesToGameHistory(pgnMoves);
      this.gameNavigation = this.chessService.getGameNavigationFromHistory(this.gameHistory);

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
    if (!this.gameHistory) return;

    this.isNavigatingHistory = true;
    try {
      this.gameHistory = this.chessService.goToStartInHistory(this.localChess, this.gameHistory);
      this.gameNavigation = this.chessService.getGameNavigationFromHistory(this.gameHistory);
      this.currentPosition.set(this.localChess.fen());
      console.log('🎯 Navigated to start');
    } catch (error) {
      console.error('Error navigating to start:', error);
    } finally {
      this.isNavigatingHistory = false;
    }
  }

  goToPrevious(): void {
    if (!this.gameHistory || !this.canGoBack) return;

    this.isNavigatingHistory = true;
    try {
      // Charger la position actuelle dans localChess
      this.localChess.load(this.currentPosition());

      this.gameHistory = this.chessService.goToPreviousInHistory(this.localChess, this.gameHistory);
      this.gameNavigation = this.chessService.getGameNavigationFromHistory(this.gameHistory);
      this.currentPosition.set(this.localChess.fen());
      console.log('🎯 Navigated to previous move');
    } catch (error) {
      console.error('Error navigating to previous:', error);
    } finally {
      this.isNavigatingHistory = false;
    }
  }

  goToNext(): void {
    if (!this.gameHistory || !this.canGoForward) return;

    this.isNavigatingHistory = true;
    try {
      // Charger la position actuelle dans localChess
      this.localChess.load(this.currentPosition());

      this.gameHistory = this.chessService.goToNextInHistory(this.localChess, this.gameHistory);
      this.gameNavigation = this.chessService.getGameNavigationFromHistory(this.gameHistory);
      this.currentPosition.set(this.localChess.fen());
      console.log('🎯 Navigated to next move');
    } catch (error) {
      console.error('Error navigating to next:', error);
    } finally {
      this.isNavigatingHistory = false;
    }
  }

  goToEnd(): void {
    if (!this.gameHistory) return;

    this.isNavigatingHistory = true;
    try {
      this.gameHistory = this.chessService.goToEndInHistory(this.localChess, this.gameHistory);
      this.gameNavigation = this.chessService.getGameNavigationFromHistory(this.gameHistory);
      this.currentPosition.set(this.localChess.fen());
      console.log('🎯 Navigated to end');
    } catch (error) {
      console.error('Error navigating to end:', error);
    } finally {
      this.isNavigatingHistory = false;
    }
  }

  getCurrentMoveDisplay(): string {
    const current = this.gameNavigation.currentMove;
    const total = this.gameNavigation.totalMoves;

    if (current === 0) {
      return `Starting position (0/${total})`;
    }

    return `Move ${current}/${total}`;
  }
}
