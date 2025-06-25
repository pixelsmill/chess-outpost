import { Injectable, signal, computed, inject } from '@angular/core';
import { Chess } from 'chess.js';
import { ChessService, GameHistory, GameNavigation } from './chess.service';
import { GameAnalysisService, GameAnalysisResult } from './game-analysis.service';

@Injectable({
    providedIn: 'root'
})
export class GameNavigationService {
    // === ÉTAT CENTRALISÉ ===
    private gameHistory: GameHistory | null = null;
    private localChess = new Chess();
    private isNavigating = false;

    // Service d'analyse complète
    private gameAnalysisService = inject(GameAnalysisService);

    // Résultat de l'analyse complète (stocké pour la timeline)
    private completeAnalysis: GameAnalysisResult | null = null;

    // === SIGNALS RÉACTIFS ===
    gameNavigation = signal<GameNavigation>({
        currentMove: 0,
        totalMoves: 0,
        canGoBack: false,
        canGoForward: false
    });

    currentPosition = signal<string>('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

    // === COMPUTED PROPERTIES ===
    canGoBack = computed(() => this.gameNavigation().canGoBack);
    canGoForward = computed(() => this.gameNavigation().canGoForward);
    canNavigate = computed(() => this.gameHistory !== null && this.gameHistory.moves.length > 0);
    currentMove = computed(() => this.gameNavigation().currentMove);
    totalMoves = computed(() => this.gameNavigation().totalMoves);

    constructor(private chessService: ChessService) { }

    // === API PUBLIQUE ===

    /**
     * Initialise un nouvel historique
     */
    initializeHistory(startingFen?: string): void {
        this.gameHistory = this.chessService.createGameHistory(startingFen);
        this.updateNavigation();
        if (startingFen) {
            this.localChess.load(startingFen);
            this.currentPosition.set(startingFen);
        } else {
            this.localChess.reset();
            this.currentPosition.set('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
        }
    }

    /**
     * Ajoute un coup à l'historique
     */
    addMove(move: { san: string; from: string; to: string; fen: string }): void {
        if (!this.gameHistory || this.isNavigating) return;

        this.gameHistory = this.chessService.addMoveToHistory(this.gameHistory, move);
        this.updateNavigation();
        this.localChess.load(move.fen);
        this.currentPosition.set(move.fen);
    }

    /**
     * Charge l'historique à partir d'une liste de coups
     */
    loadFromMoves(moves: any[], startingFen?: string): void {
        this.gameHistory = this.chessService.convertMovesToGameHistory(moves, startingFen);
        this.updateNavigation();

        // Aller à la fin de l'historique
        if (this.gameHistory.moves.length > 0) {
            const lastMove = this.gameHistory.moves[this.gameHistory.moves.length - 1];
            this.localChess.load(lastMove.fen);
            this.currentPosition.set(lastMove.fen);
        } else {
            this.localChess.load(startingFen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
            this.currentPosition.set(startingFen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
        }

        // Pré-analyser toute la partie pour la timeline
        this.preAnalyzeGame();
    }

    /**
     * Va au début de la partie
     */
    goToStart(): void {
        if (!this.gameHistory) return;

        this.isNavigating = true;
        try {
            this.gameHistory = this.chessService.goToStartInHistory(this.localChess, this.gameHistory);
            this.updateNavigation();
            this.currentPosition.set(this.localChess.fen());
        } catch (error) {
            console.error('Error navigating to start:', error);
        } finally {
            this.isNavigating = false;
        }
    }

    /**
     * Va au coup précédent
     */
    goToPrevious(): void {
        if (!this.gameHistory || !this.canGoBack()) return;

        this.isNavigating = true;
        try {
            // Charger la position actuelle dans localChess
            this.localChess.load(this.currentPosition());

            this.gameHistory = this.chessService.goToPreviousInHistory(this.localChess, this.gameHistory);
            this.updateNavigation();
            this.currentPosition.set(this.localChess.fen());
        } catch (error) {
            console.error('Error navigating to previous:', error);
        } finally {
            this.isNavigating = false;
        }
    }

    /**
     * Va au coup suivant
     */
    goToNext(): void {
        if (!this.gameHistory || !this.canGoForward()) return;

        this.isNavigating = true;
        try {
            // Charger la position actuelle dans localChess
            this.localChess.load(this.currentPosition());

            this.gameHistory = this.chessService.goToNextInHistory(this.localChess, this.gameHistory);
            this.updateNavigation();
            this.currentPosition.set(this.localChess.fen());
        } catch (error) {
            console.error('Error navigating to next:', error);
        } finally {
            this.isNavigating = false;
        }
    }

    /**
     * Va à la fin de la partie
     */
    goToEnd(): void {
        if (!this.gameHistory) return;

        this.isNavigating = true;
        try {
            this.gameHistory = this.chessService.goToEndInHistory(this.localChess, this.gameHistory);
            this.updateNavigation();
            this.currentPosition.set(this.localChess.fen());
        } catch (error) {
            console.error('Error navigating to end:', error);
        } finally {
            this.isNavigating = false;
        }
    }

    /**
     * Remet à la position courante (fin de l'historique)
     */
    returnToCurrentPosition(): void {
        if (!this.gameHistory) return;

        this.isNavigating = true;
        try {
            // Remettre l'historique à la fin
            this.gameHistory.currentMoveIndex = this.gameHistory.moves.length - 1;
            this.updateNavigation();

            // Charger la position de fin
            if (this.gameHistory.moves.length > 0) {
                const lastMove = this.gameHistory.moves[this.gameHistory.moves.length - 1];
                this.localChess.load(lastMove.fen);
                this.currentPosition.set(lastMove.fen);
            } else {
                this.localChess.load(this.gameHistory.startingFen);
                this.currentPosition.set(this.gameHistory.startingFen);
            }
        } catch (error) {
            console.error('Error returning to current position:', error);
        } finally {
            this.isNavigating = false;
        }
    }

    /**
     * Réinitialise l'historique
     */
    reset(startingFen?: string): void {
        this.gameHistory = this.chessService.createGameHistory(startingFen);
        this.updateNavigation();

        const fen = startingFen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
        this.localChess.load(fen);
        this.currentPosition.set(fen);
    }

    /**
     * Vérifie si on est à la position courante de la partie
     */
    isAtCurrentPosition(): boolean {
        if (!this.gameHistory) return true;
        return this.gameHistory.currentMoveIndex === this.gameHistory.moves.length - 1;
    }

    /**
     * Obtient l'affichage du coup courant
     */
    getCurrentMoveDisplay(): string {
        const current = this.currentMove();
        const total = this.totalMoves();

        if (current === 0) {
            return `Starting position (0/${total})`;
        }

        return `Move ${current}/${total}`;
    }

    /**
     * Vérifie si on navigue actuellement
     */
    isCurrentlyNavigating(): boolean {
        return this.isNavigating;
    }

    /**
     * Obtient l'historique des positions FEN pour la timeline
     */
    getPositionHistory(): string[] {
        if (!this.gameHistory) return [];

        const positions = [this.gameHistory.startingFen];

        this.gameHistory.moves.forEach(move => {
            positions.push(move.fen);
        });

        return positions;
    }

    /**
     * Va à un coup spécifique (pour la timeline)
     */
    goToMove(moveIndex: number): void {
        if (!this.gameHistory) return;

        this.isNavigating = true;
        try {
            this.gameHistory = this.chessService.goToMoveInHistory(this.localChess, this.gameHistory, moveIndex - 1);
            this.updateNavigation();
            this.currentPosition.set(this.localChess.fen());
        } catch (error) {
            console.error('Error navigating to move:', error);
        } finally {
            this.isNavigating = false;
        }
    }

    /**
     * Pré-analyse toute la partie pour la timeline
     */
    private preAnalyzeGame(): void {
        if (!this.gameHistory || this.gameHistory.moves.length === 0) {
            this.completeAnalysis = null;
            return;
        }

        console.log('🔍 GameNavigation: Pré-analyse de la partie complète');

        const positions = this.getPositionHistory();
        const sanMoves = this.gameHistory.moves.map(move => move.san);

        this.completeAnalysis = this.gameAnalysisService.analyzeCompleteGame(positions, sanMoves);

        console.log('📊 Analyse terminée:', this.completeAnalysis.periods.length, 'périodes,', this.completeAnalysis.criticalMoments.length, 'moments critiques');
    }

    /**
     * Obtient le résultat de l'analyse complète
     */
    getCompleteAnalysis(): GameAnalysisResult | null {
        return this.completeAnalysis;
    }

    // === MÉTHODES PRIVÉES ===

    private updateNavigation(): void {
        if (this.gameHistory) {
            this.gameNavigation.set(this.chessService.getGameNavigationFromHistory(this.gameHistory));
        } else {
            this.gameNavigation.set({
                currentMove: 0,
                totalMoves: 0,
                canGoBack: false,
                canGoForward: false
            });
        }
    }
} 