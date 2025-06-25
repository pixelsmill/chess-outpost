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
import { GameNavigationService } from '../../services/game-navigation.service';

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
    public gameNavigationService = inject(GameNavigationService);

    // Signal pour synchroniser la position
    currentPosition = signal<string>('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

    // Signal pour l'orientation de l'échiquier
    boardOrientation = signal<'white' | 'black'>('white');

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

        // Initialiser l'historique de navigation
        this.gameNavigationService.initializeHistory();

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

                    // Mettre à jour l'orientation
                    const orientation = this.calculateBoardOrientation(game);
                    this.boardOrientation.set(orientation);
                    console.log('🎯 Board orientation updated to:', orientation);

                    // Créer/mettre à jour l'historique de la partie
                    this.updateGameHistory(game);

                    // Vérifier et afficher l'orientation calculée
                    const orientationCalculated = this.getBoardOrientation();
                    console.log('🎯 Board orientation determined:', orientationCalculated);

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
                    // Partie nulle - réinitialiser l'historique avec le service
                    this.gameNavigationService.reset();

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
                        console.log('🎮 PlayComponent: No game, resetting position to initial state');
                        this.currentPosition.set('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
                    }

                    // Réinitialiser les références locales
                    this.currentGame = null;
                    this.gameId = null;
                }
            })
        );
    }

    /**
     * Met à jour l'historique de la partie avec les coups reçus
     */
    private updateGameHistory(game: GameState): void {
        if (!game || !game.moves) {
            console.log('🎮 No moves to update history with');
            return;
        }

        console.log('🎮 Updating game history with moves:', game.moves.length);

        // Utiliser le service centralisé pour charger l'historique
        // Note: startingFen n'existe pas sur GameState, on utilise undefined par défaut
        this.gameNavigationService.loadFromMoves(game.moves);

        console.log('🎮 Game history updated via service');
    }

    async quickMatch() {
        if (this.isQuickMatching) return;

        this.isQuickMatching = true;
        try {
            await this.multiplayerService.quickMatch();
        } catch (error) {
            console.error('Error during quick match:', error);
            this.isQuickMatching = false;
        }
    }

    async challengePlayer(player: OnlinePlayer) {
        if (this.challengingPlayer) return;

        this.challengingPlayer = player.uid;
        try {
            await this.multiplayerService.challengePlayer(player);
            this.challengingPlayer = null;
        } catch (error) {
            console.error('Error challenging player:', error);
            this.challengingPlayer = null;
        }
    }

    async acceptChallenge(challenge: Challenge) {
        try {
            await this.multiplayerService.acceptChallenge(challenge.id);
        } catch (error) {
            console.error('Error accepting challenge:', error);
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
        if (!currentUser || !this.currentGame?.players) return null;

        if (this.currentGame.players.white?.uid === currentUser.uid) {
            return { ...this.currentGame.players.white, color: 'white' };
        } else if (this.currentGame.players.black?.uid === currentUser.uid) {
            return { ...this.currentGame.players.black, color: 'black' };
        }

        return null;
    }

    getOpponentInfo() {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser || !this.currentGame?.players) return null;

        if (this.currentGame.players.white?.uid === currentUser.uid) {
            return { ...this.currentGame.players.black, color: 'black' };
        } else if (this.currentGame.players.black?.uid === currentUser.uid) {
            return { ...this.currentGame.players.white, color: 'white' };
        }

        return null;
    }

    getGameStatus(): string {
        if (!this.currentGame) return '';

        switch (this.currentGame.status) {
            case 'waiting':
                return 'Waiting for opponent...';
            case 'active':
                if (this.isPlayerTurn()) {
                    return 'Your turn';
                } else {
                    return 'Opponent\'s turn';
                }
            case 'finished':
                return this.getEndReasonText();
            default:
                return '';
        }
    }

    private getEndReasonText(): string {
        if (!this.currentGame?.endReason) return 'Game finished';

        switch (this.currentGame.endReason) {
            case 'checkmate':
                return `Checkmate! ${this.currentGame.winner === 'white' ? 'White' : 'Black'} wins`;
            case 'resignation':
                return `${this.currentGame.winner === 'white' ? 'Black' : 'White'} resigned`;
            case 'stalemate':
                return 'Stalemate - Draw';
            case 'draw_agreement':
                return 'Game ended in a draw';
            case 'timeout':
                return `${this.currentGame.winner === 'white' ? 'Black' : 'White'} ran out of time`;
            default:
                return 'Game finished';
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
        if (!this.currentGame) return false;
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) return false;

        return this.currentGame.currentTurn === this.getCurrentPlayerInfo()?.color;
    }

    isGameFinished(): boolean {
        return this.currentGame?.status === 'finished';
    }

    async onMoveChange(move: { from: string; to: string; promotion?: string }): Promise<void> {
        console.log('🎮 PlayComponent: Move change detected:', move);

        // Vérifier qu'on est en multijoueur et que c'est notre tour
        if (!this.currentGame || !this.gameId) {
            console.log('🚫 No current game or gameId');
            return;
        }

        // Vérifier qu'on n'est pas en train de naviguer dans l'historique
        if (this.gameNavigationService.isCurrentlyNavigating()) {
            console.log('🚫 Cannot make move while navigating history');
            return;
        }

        if (!this.isPlayerTurn()) {
            console.log('🚫 Not player turn');
            return;
        }

        if (this.isGameFinished()) {
            console.log('🚫 Game is finished');
            return;
        }

        try {
            console.log('🎮 PlayComponent: Sending move to multiplayer service:', move);
            await this.multiplayerService.makeMove(this.gameId, move);
            console.log('✅ Move sent successfully');
        } catch (error) {
            console.error('❌ Error making move:', error);

            // Réinitialiser la position à la position courante en cas d'erreur
            if (this.currentGame) {
                console.log('🔄 Resetting position due to move error');
                this.currentPosition.set(this.currentGame.currentFen);
            }
        }
    }

    onPositionChange(newPosition: string): void {
        console.log('🎮 PlayComponent: Position change detected:', newPosition);

        // Si on est en mode multijoueur avec une partie active, ignorer les changements de position
        // car ils sont gérés par le service multijoueur
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
        this.boardOrientation.set('white'); // Réinitialiser l'orientation par défaut

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
        this.gameNavigationService.goToStart();
        this.updatePositionFromNavigation();
    }

    /**
     * Va au coup précédent
     */
    onGoToPrevious(): void {
        this.gameNavigationService.goToPrevious();
        this.updatePositionFromNavigation();
    }

    /**
     * Va au coup suivant
     */
    onGoToNext(): void {
        this.gameNavigationService.goToNext();
        this.updatePositionFromNavigation();
    }

    /**
     * Va à la fin de la partie
     */
    onGoToEnd(): void {
        this.gameNavigationService.goToEnd();
        this.updatePositionFromNavigation();
    }

    /**
     * Revient à la position courante de la partie (fin de l'historique)
     */
    returnToCurrentPosition(): void {
        this.gameNavigationService.returnToCurrentPosition();
        this.updatePositionFromNavigation();
    }

    private updatePositionFromNavigation(): void {
        const navPosition = this.gameNavigationService.currentPosition();
        this.currentPosition.set(navPosition);
    }

    /**
     * Vérifie si on peut naviguer (seulement si on est dans une partie et qu'il y a des coups)
     */
    get canNavigate(): boolean {
        return this.gameNavigationService.canNavigate();
    }

    /**
     * Vérifie si on est à la position courante de la partie
     */
    get isAtCurrentPosition(): boolean {
        return this.gameNavigationService.isAtCurrentPosition();
    }

    // Propriétés pour les contrôles de navigation
    get canGoBack(): boolean {
        return this.gameNavigationService.canGoBack();
    }

    get canGoForward(): boolean {
        return this.gameNavigationService.canGoForward();
    }

    get currentMove(): number {
        return this.gameNavigationService.currentMove();
    }

    get totalMoves(): number {
        return this.gameNavigationService.totalMoves();
    }

    get currentMoveDisplay(): string {
        return `${this.currentMove}/${this.totalMoves}`;
    }

    /**
     * Retourne l'orientation actuelle de l'échiquier en fonction du joueur
     */
    flipBoard(): void {
        const currentOrientation = this.boardOrientation();
        const newOrientation: 'white' | 'black' = currentOrientation === 'white' ? 'black' : 'white';
        this.boardOrientation.set(newOrientation);
        console.log('🎯 Board manually flipped to:', newOrientation);
    }

    private calculateBoardOrientation(game: GameState): 'white' | 'black' {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser || !game.players) return 'white';

        if (game.players.white?.uid === currentUser.uid) {
            return 'white';
        } else if (game.players.black?.uid === currentUser.uid) {
            return 'black';
        }

        return 'white';
    }
} 