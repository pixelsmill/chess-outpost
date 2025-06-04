import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { User } from '@angular/fire/auth';
import { filter, take, timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Chess } from 'chess.js';

// Services
import { MultiplayerService } from '../../services/multiplayer.service';
import { AuthService } from '../../services/auth.service';
import { BoardDisplayService, BackgroundType } from '../../services/board-display.service';
import { ChessService, GameHistory, GameNavigation } from '../../services/chess.service';

// Models
import { OnlinePlayer, GameState, Challenge } from '../../models/game.model';

// Components
import { ChessBoardWithControlsComponent } from '../../shared/chess-board-with-controls/chess-board-with-controls.component';

@Component({
    selector: 'app-play',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ChessBoardWithControlsComponent
    ],
    templateUrl: './play.component.html',
    styleUrls: ['../../styles/shared-layout.scss', './play.component.scss']
})
export class PlayComponent implements OnInit, OnDestroy {
    private multiplayerService = inject(MultiplayerService);
    authService = inject(AuthService);
    public boardDisplay = inject(BoardDisplayService);
    private chessService = inject(ChessService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    // Signal pour synchroniser la position
    currentPosition = signal<string>('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

    // Gestion de l'historique et navigation
    gameHistory: GameHistory | null = null;
    gameNavigation: GameNavigation = { currentMove: 0, totalMoves: 0, canGoBack: false, canGoForward: false };
    isNavigatingHistory = false; // Flag pour éviter les boucles lors de la navigation

    // Données utilisateur et multijoueur
    user$: Observable<User | null> = this.authService.user$;
    onlinePlayers: OnlinePlayer[] = [];
    currentGame: GameState | null = null;
    challenges: Challenge[] = [];

    // États de l'interface
    isQuickMatching = false;
    challengingPlayer: string | null = null;
    isResigning = false;
    isLeavingGame = false;

    // Gérer la partie en cours
    gameId: string | null = null;
    private subscriptions: Subscription[] = [];

    ngOnInit() {
        console.log('🚀 PlayComponent ngOnInit called');

        // Vérifier si on a un gameId dans la route (child routes)
        this.gameId = this.route.snapshot.paramMap.get('gameId') ||
            this.route.firstChild?.snapshot.paramMap.get('gameId') ||
            null;
        console.log('🚀 Initial gameId from route:', this.gameId);
        console.log('🚀 Route snapshot params:', this.route.snapshot.paramMap.keys);
        console.log('🚀 Route firstChild params:', this.route.firstChild?.snapshot.paramMap.keys);

        // Charger les données seulement si l'utilisateur est connecté
        this.user$.subscribe(user => {
            console.log('🚀 User subscription triggered:', user ? user.displayName : 'Not logged in');
            if (user) {
                this.loadOnlinePlayers();
                this.loadChallenges();
                this.listenToCurrentGame();

                // Si on a un gameId, écouter cette partie spécifique et attendre qu'elle soit disponible
                if (this.gameId) {
                    console.log('🚀 User is authenticated, now waiting for specific game:', this.gameId);

                    // Attendre que le service soit initialisé
                    this.subscriptions.push(
                        this.multiplayerService.isInitialized$.pipe(
                            filter(isInitialized => isInitialized),
                            take(1)
                        ).subscribe(() => {
                            console.log('🚀 Service is initialized, starting to load game:', this.gameId);
                            this.subscriptions.push(
                                this.multiplayerService.waitForGame(this.gameId!).subscribe({
                                    next: (game) => {
                                        if (game) {
                                            console.log('🚀 Game successfully loaded after refresh:', game.id);
                                            console.log('🚀 Game position:', game.currentFen);
                                            console.log('🚀 Game moves count:', game.moves?.length || 0);
                                        } else {
                                            console.log('🚀 Game loading failed, going back to lobby');
                                            alert(`La partie ${this.gameId} n'existe pas ou a été supprimée.`);
                                            this.backToLobby();
                                        }
                                    },
                                    error: (error) => {
                                        console.error('🚀 Error loading game:', error);
                                        alert(`Erreur lors du chargement de la partie ${this.gameId}. Elle n'existe peut-être plus.`);
                                        this.backToLobby();
                                    }
                                })
                            );
                        })
                    );
                } else {
                    // Pas de gameId, on est au lobby - s'assurer que la position est réinitialisée
                    console.log('🚀 No gameId, ensuring lobby position is set');
                    this.currentPosition.set('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
                }
            }
        });
    }

    ngOnDestroy() {
        this.isLeavingGame = true;
        this.subscriptions.forEach(sub => sub.unsubscribe());
        this.multiplayerService.leaveGame();
    }

    /**
     * Méthodes multijoueur du lobby
     */
    private loadOnlinePlayers(): void {
        console.log('🎮 PlayComponent: Setting up online players subscription');
        this.subscriptions.push(
            this.multiplayerService.onlinePlayers$.subscribe(players => {
                console.log('🎮 PlayComponent: Received online players:', players.map(p => p.displayName));
                this.onlinePlayers = players;
            })
        );
    }

    private loadChallenges(): void {
        console.log('🎮 PlayComponent: Setting up challenges subscription');
        this.subscriptions.push(
            this.multiplayerService.challenges$.subscribe(challenges => {
                console.log('🎮 PlayComponent: Received challenges:', challenges.length);
                this.challenges = challenges;
            })
        );
    }

    private listenToCurrentGame(): void {
        this.subscriptions.push(
            this.multiplayerService.currentGame$.subscribe((game: GameState | null) => {
                console.log('🎮 PlayComponent: Current game subscription triggered', game ? game.id : 'null');

                // Si on a une partie
                if (game) {
                    // Mettre à jour la position immédiatement
                    console.log('🎮 PlayComponent: Updating position to:', game.currentFen);
                    this.currentPosition.set(game.currentFen);
                    this.gameId = game.id;
                    this.currentGame = game;

                    // Créer/mettre à jour l'historique de la partie
                    this.updateGameHistory(game);

                    // Vérifier et afficher l'orientation calculée
                    const orientation = this.getBoardOrientation();
                    console.log('🎯 Board orientation determined:', orientation);

                    // Mettre à jour l'URL sans page intermédiaire SEULEMENT si on est sur /play
                    if (this.router.url === '/play') {
                        console.log('🎮 PlayComponent: Navigating to game URL:', `/play/game/${game.id}`);
                        this.router.navigate(['/play/game', game.id], { replaceUrl: true });
                    }

                    // La partie est terminée, le joueur pourra cliquer sur "Back to Lobby" quand il le souhaite
                    if (game.status === 'finished') {
                        console.log('🎮 PlayComponent: Game finished, waiting for manual navigation');
                    }
                } else {
                    // Partie nulle - réinitialiser l'historique
                    this.gameHistory = null;
                    this.gameNavigation = { currentMove: 0, totalMoves: 0, canGoBack: false, canGoForward: false };

                    // Partie nulle - mais seulement rediriger si on avait déjà une partie chargée
                    if (this.currentGame && this.gameId && !this.isLeavingGame) {
                        console.log('🎮 PlayComponent: Game was loaded and now lost, going back to lobby');
                        this.backToLobby();
                    } else if (this.gameId && !this.isLeavingGame) {
                        console.log('🎮 PlayComponent: Game is null but gameId exists - waiting for game to load');
                        // Ne rien faire, attendre que waitForGame() charge la partie
                    } else if (this.gameId) {
                        console.log('🎮 PlayComponent: Game is null but we are leaving, ignoring');
                    } else {
                        console.log('🎮 PlayComponent: Game is null and no gameId set, normal lobby state');
                        // Remettre la position de départ si on est au lobby
                        console.log('🔄 Réinitialisation de la position de l\'échiquier pour le lobby');
                        this.currentPosition.set('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
                        this.currentGame = null;
                    }
                }
            })
        );
    }

    /**
     * Met à jour l'historique de la partie à partir des moves
     */
    private updateGameHistory(game: GameState): void {
        if (!game.moves || game.moves.length === 0) {
            // Pas encore de coups, créer un historique vide
            this.gameHistory = this.chessService.createGameHistory();
            this.gameNavigation = this.chessService.getGameNavigationFromHistory(this.gameHistory);
            return;
        }

        // Convertir les moves en GameHistory
        try {
            this.gameHistory = this.chessService.convertMovesToGameHistory(game.moves);
            this.gameNavigation = this.chessService.getGameNavigationFromHistory(this.gameHistory);
            console.log('🎮 Game history updated:', {
                moves: this.gameHistory.moves.length,
                currentMove: this.gameNavigation.currentMove,
                totalMoves: this.gameNavigation.totalMoves
            });
        } catch (error) {
            console.error('Error updating game history:', error);
            // Fallback : créer un historique vide
            this.gameHistory = this.chessService.createGameHistory();
            this.gameNavigation = this.chessService.getGameNavigationFromHistory(this.gameHistory);
        }
    }

    async quickMatch() {
        this.isQuickMatching = true;
        try {
            const challengeId = await this.multiplayerService.quickMatch();
            console.log('Quick match started:', challengeId);
        } catch (error) {
            console.error('Error during quick match:', error);
            alert('No players available at the moment');
        } finally {
            this.isQuickMatching = false;
        }
    }

    async challengePlayer(player: OnlinePlayer) {
        this.challengingPlayer = player.uid;
        try {
            const challengeId = await this.multiplayerService.challengePlayer(player);
            console.log('Challenge sent:', challengeId);
        } catch (error) {
            console.error('Error sending challenge:', error);
        } finally {
            this.challengingPlayer = null;
        }
    }

    async acceptChallenge(challenge: Challenge) {
        try {
            console.log('🎮 Accepting challenge from:', challenge.from.displayName);
            const gameId = await this.multiplayerService.acceptChallenge(challenge.id);
            console.log('🎮 Challenge accepted, game created:', gameId);

            // Navigation directe vers la partie - pas besoin d'attendre
            // La partie vient d'être créée donc elle existe
            this.router.navigate(['/play/game', gameId], { replaceUrl: true });
        } catch (error) {
            console.error('🎮 Error accepting challenge:', error);
        }
    }

    async declineChallenge(challenge: Challenge) {
        try {
            await this.multiplayerService.declineChallenge(challenge.id);
        } catch (error) {
            console.error('Error declining challenge:', error);
        }
    }

    signInWithGoogle() {
        this.authService.loginWithGoogle();
    }

    /**
     * Méthodes de la partie en cours
     */
    getCurrentPlayerInfo() {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser || !this.currentGame) return null;

        const isWhite = this.currentGame.players.white.uid === currentUser.uid;
        return {
            color: isWhite ? 'white' : 'black',
            isCurrentTurn: this.currentGame.currentTurn === (isWhite ? 'white' : 'black'),
            displayName: isWhite ? this.currentGame.players.white.displayName : this.currentGame.players.black.displayName
        };
    }

    getOpponentInfo() {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser || !this.currentGame) return null;

        const isWhite = this.currentGame.players.white.uid === currentUser.uid;
        const opponent = isWhite ? this.currentGame.players.black : this.currentGame.players.white;

        return {
            color: isWhite ? 'black' : 'white',
            displayName: opponent.displayName,
            photoURL: opponent.photoURL
        };
    }

    getGameStatus(): string {
        if (!this.currentGame) return 'Loading...';

        const playerInfo = this.getCurrentPlayerInfo();
        if (!playerInfo) return 'Error';

        if (this.currentGame.status === 'finished') {
            if (this.currentGame.winner === 'draw') {
                return `Draw (${this.getEndReasonText()})`;
            } else if (this.currentGame.winner === playerInfo.color) {
                return `You won! (${this.getEndReasonText()})`;
            } else {
                return `You lost (${this.getEndReasonText()})`;
            }
        }

        return playerInfo.isCurrentTurn ? 'Your turn' : 'Opponent\'s turn';
    }

    private getEndReasonText(): string {
        if (!this.currentGame) return '';

        switch (this.currentGame.endReason) {
            case 'checkmate': return 'Checkmate';
            case 'resignation': return 'Resignation';
            case 'timeout': return 'Time out';
            case 'stalemate': return 'Stalemate';
            case 'draw_agreement': return 'Draw agreement';
            default: return '';
        }
    }

    getBoardOrientation(): 'white' | 'black' {
        const playerInfo = this.getCurrentPlayerInfo();

        // Si on a les infos du joueur, utiliser sa couleur
        if (playerInfo) {
            return playerInfo.color as 'white' | 'black';
        }

        // Sinon, essayer de déterminer la couleur directement depuis currentGame
        const currentUser = this.authService.getCurrentUser();
        if (currentUser && this.currentGame?.players) {
            // Vérifier si l'utilisateur est le joueur blanc
            if (this.currentGame.players.white?.uid === currentUser.uid) {
                console.log('🎯 Board orientation: white (from direct check)');
                return 'white';
            }
            // Vérifier si l'utilisateur est le joueur noir
            else if (this.currentGame.players.black?.uid === currentUser.uid) {
                console.log('🎯 Board orientation: black (from direct check)');
                return 'black';
            }
        }

        // Par défaut, retourner white
        console.log('🎯 Board orientation: white (default fallback)');
        return 'white';
    }

    isPlayerTurn(): boolean {
        const playerInfo = this.getCurrentPlayerInfo();
        const result = playerInfo?.isCurrentTurn || false;
        console.log('🔍 isPlayerTurn check:', { playerInfo, result });
        return result;
    }

    isGameFinished(): boolean {
        return this.currentGame?.status === 'finished';
    }

    async onMoveChange(move: { from: string; to: string; promotion?: string }): Promise<void> {
        console.log('🎮 PlayComponent onMoveChange called with:', move);

        if (!this.gameId || !this.currentGame) {
            console.log('🎮 Missing gameId or currentGame:', { gameId: this.gameId, currentGame: this.currentGame });
            return;
        }

        const playerInfo = this.getCurrentPlayerInfo();
        if (!playerInfo) {
            console.log('🎮 No player info available');
            return;
        }

        // Si on navigue dans l'historique, revenir à la position courante d'abord
        if (!this.isAtCurrentPosition) {
            console.log('🎮 Player is navigating history, returning to current position before move');
            this.returnToCurrentPosition();
            // Permettre au joueur de refaire le coup après retour à la position courante
            return;
        }

        // Vérification basique du tour
        if (!playerInfo.isCurrentTurn) {
            console.log('🎮 Not player turn');
            // Restaurer la position précédente
            this.currentPosition.set(this.currentGame.currentFen);
            return;
        }

        // Vérification si la partie est terminée
        if (this.currentGame.status === 'finished') {
            console.log('🎮 Game is finished');
            this.currentPosition.set(this.currentGame.currentFen);
            return;
        }

        try {
            console.log('🎮 Sending move to multiplayer service...');
            await this.multiplayerService.makeMove(this.gameId, move);
            console.log('🎮 Move sent successfully!');
        } catch (error) {
            console.error('🎮 Error making move:', error);
            // En cas d'erreur, restaurer la position précédente
            this.currentPosition.set(this.currentGame.currentFen);
        }
    }

    /**
     * Gestion des changements de position (pour compatibilité avec l'ancien code)
     */
    onPositionChange(newPosition: string): void {
        console.log('🎮 onPositionChange called with:', newPosition);

        // En mode multijoueur, ne pas permettre les changements de position directs
        // La position doit seulement changer via les coups validés
        if (this.currentGame && this.gameId) {
            console.log('🎮 In multiplayer mode, ignoring position change');
            return;
        }

        // Sinon, mettre à jour la position (mode hors ligne)
        this.currentPosition.set(newPosition);
    }

    async resignGame(): Promise<void> {
        if (!this.gameId || this.isResigning) return;

        const confirmResign = confirm('Are you sure you want to resign this game?');
        if (!confirmResign) return;

        this.isResigning = true;
        try {
            await this.multiplayerService.resignGame(this.gameId);
        } catch (error) {
            console.error('Error resigning game:', error);
            this.isResigning = false;
        }
    }

    backToLobby(): void {
        this.isLeavingGame = true;

        // Quitter la partie
        this.multiplayerService.leaveGame();

        // Réinitialiser les états
        this.gameId = null;
        this.currentGame = null;
        this.isResigning = false;

        // Réinitialiser la position de l'échiquier
        console.log('🔄 Réinitialisation de la position de l\'échiquier au lobby');
        this.currentPosition.set('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

        // Naviguer vers le lobby
        this.router.navigate(['/play'], { replaceUrl: true }).then(() => {
            // Remettre le flag à false après navigation réussie
            this.isLeavingGame = false;
        });
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'available': return '#22c55e';
            case 'in_game': return '#f59e0b';
            case 'away': return '#6b7280';
            default: return '#6b7280';
        }
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'available': return 'Available';
            case 'in_game': return 'In game';
            case 'away': return 'Away';
            default: return 'Offline';
        }
    }

    goHome(): void {
        this.router.navigate(['/']);
    }

    // === GESTION DES CONTRÔLES DE NAVIGATION ===

    /**
     * Va au début de la partie
     */
    onGoToStart(): void {
        if (!this.gameHistory || this.isNavigatingHistory) return;

        this.isNavigatingHistory = true;
        const tempChess = new Chess(); // Échiquier temporaire pour la navigation

        try {
            this.gameHistory = this.chessService.goToStartInHistory(tempChess, this.gameHistory);
            this.gameNavigation = this.chessService.getGameNavigationFromHistory(this.gameHistory);
            this.currentPosition.set(tempChess.fen());
            console.log('🎮 Navigated to start of game');
        } catch (error) {
            console.error('Error navigating to start:', error);
        } finally {
            this.isNavigatingHistory = false;
        }
    }

    /**
     * Va au coup précédent
     */
    onGoToPrevious(): void {
        if (!this.gameHistory || this.isNavigatingHistory) return;

        this.isNavigatingHistory = true;
        const tempChess = new Chess(); // Échiquier temporaire pour la navigation

        try {
            // Charger la position actuelle
            const currentFen = this.currentPosition();
            tempChess.load(currentFen);

            this.gameHistory = this.chessService.goToPreviousInHistory(tempChess, this.gameHistory);
            this.gameNavigation = this.chessService.getGameNavigationFromHistory(this.gameHistory);
            this.currentPosition.set(tempChess.fen());
            console.log('🎮 Navigated to previous move');
        } catch (error) {
            console.error('Error navigating to previous:', error);
        } finally {
            this.isNavigatingHistory = false;
        }
    }

    /**
     * Va au coup suivant
     */
    onGoToNext(): void {
        if (!this.gameHistory || this.isNavigatingHistory) return;

        this.isNavigatingHistory = true;
        const tempChess = new Chess(); // Échiquier temporaire pour la navigation

        try {
            // Charger la position actuelle
            const currentFen = this.currentPosition();
            tempChess.load(currentFen);

            this.gameHistory = this.chessService.goToNextInHistory(tempChess, this.gameHistory);
            this.gameNavigation = this.chessService.getGameNavigationFromHistory(this.gameHistory);
            this.currentPosition.set(tempChess.fen());
            console.log('🎮 Navigated to next move');
        } catch (error) {
            console.error('Error navigating to next:', error);
        } finally {
            this.isNavigatingHistory = false;
        }
    }

    /**
     * Va à la fin de la partie
     */
    onGoToEnd(): void {
        if (!this.gameHistory || this.isNavigatingHistory) return;

        this.isNavigatingHistory = true;
        const tempChess = new Chess(); // Échiquier temporaire pour la navigation

        try {
            this.gameHistory = this.chessService.goToEndInHistory(tempChess, this.gameHistory);
            this.gameNavigation = this.chessService.getGameNavigationFromHistory(this.gameHistory);
            this.currentPosition.set(tempChess.fen());
            console.log('🎮 Navigated to end of game');
        } catch (error) {
            console.error('Error navigating to end:', error);
        } finally {
            this.isNavigatingHistory = false;
        }
    }

    /**
     * Revient à la position courante de la partie (fin de l'historique)
     */
    returnToCurrentPosition(): void {
        if (!this.currentGame || !this.gameHistory) return;

        this.isNavigatingHistory = true;
        try {
            // Remettre à la position courante de la partie
            this.currentPosition.set(this.currentGame.currentFen);

            // Remettre l'historique à la fin
            this.gameHistory.currentMoveIndex = this.gameHistory.moves.length - 1;
            this.gameNavigation = this.chessService.getGameNavigationFromHistory(this.gameHistory);

            console.log('🎮 Returned to current game position');
        } catch (error) {
            console.error('Error returning to current position:', error);
        } finally {
            this.isNavigatingHistory = false;
        }
    }

    /**
     * Vérifie si on peut naviguer (seulement si on est dans une partie et qu'il y a des coups)
     */
    get canNavigate(): boolean {
        return this.gameHistory !== null && this.gameHistory.moves.length > 0;
    }

    /**
     * Vérifie si on est à la position courante de la partie
     */
    get isAtCurrentPosition(): boolean {
        if (!this.gameHistory || !this.currentGame) return true;
        return this.gameHistory.currentMoveIndex === this.gameHistory.moves.length - 1;
    }
} 