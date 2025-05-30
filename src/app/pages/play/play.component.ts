import { Component, signal, inject, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs';
import { User } from '@angular/fire/auth';

// Services
import { MultiplayerService } from '../../services/multiplayer.service';
import { AuthService } from '../../services/auth.service';
import { BoardDisplayService, BackgroundType } from '../../services/board-display.service';

// Models
import { OnlinePlayer, GameState, Challenge } from '../../models/game.model';

// Components
import { EchiquierComponent } from '../../echiquier/echiquier.component';
import { BoardWrapperComponent } from '../../board-wrapper/board-wrapper.component';
import { HeatmapBoardComponent } from '../../backgrounds/heatmap-board/heatmap-board.component';
import { TopographicBoardComponent } from '../../backgrounds/topographic-board/topographic-board.component';

@Component({
    selector: 'app-play',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        EchiquierComponent,
        BoardWrapperComponent,
        HeatmapBoardComponent,
        TopographicBoardComponent
    ],
    templateUrl: './play.component.html',
    styleUrls: ['../../styles/shared-layout.scss', './play.component.scss']
})
export class PlayComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('boardSection', { static: true }) boardSection!: ElementRef<HTMLElement>;

    private multiplayerService = inject(MultiplayerService);
    authService = inject(AuthService);
    public boardDisplay = inject(BoardDisplayService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    // Signal pour synchroniser la position
    currentPosition = signal<string>('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

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
    redirectCountdown = 0;

    // Gérer la partie en cours
    gameId: string | null = null;
    private redirectTimer: any;
    private subscriptions: Subscription[] = [];

    ngOnInit() {
        // Vérifier si on a un gameId dans la route
        this.gameId = this.route.snapshot.paramMap.get('gameId');

        // Charger les données seulement si l'utilisateur est connecté
        this.user$.subscribe(user => {
            if (user) {
                this.loadOnlinePlayers();
                this.loadChallenges();
                this.listenToCurrentGame();

                // Si on a un gameId, écouter cette partie spécifique
                if (this.gameId) {
                    this.multiplayerService.listenToGame(this.gameId);
                }
            }
        });
    }

    ngOnDestroy() {
        this.isLeavingGame = true;
        this.subscriptions.forEach(sub => sub.unsubscribe());
        if (this.redirectTimer) {
            clearInterval(this.redirectTimer);
        }
        this.multiplayerService.leaveGame();

        this.boardDisplay.cleanup();
    }

    ngAfterViewInit() {
        this.boardDisplay.setupResizeObserver(this.boardSection);
    }

    /**
     * Méthodes multijoueur du lobby
     */
    private loadOnlinePlayers(): void {
        this.subscriptions.push(
            this.multiplayerService.onlinePlayers$.subscribe(players => {
                this.onlinePlayers = players;
            })
        );
    }

    private loadChallenges(): void {
        this.subscriptions.push(
            this.multiplayerService.challenges$.subscribe(challenges => {
                this.challenges = challenges;
            })
        );
    }

    private listenToCurrentGame(): void {
        this.subscriptions.push(
            this.multiplayerService.currentGame$.subscribe((game: GameState | null) => {
                this.currentGame = game;
                if (game) {
                    this.currentPosition.set(game.currentFen);
                    this.gameId = game.id;

                    // Mettre à jour l'URL sans page intermédiaire
                    if (this.router.url === '/play') {
                        this.router.navigate(['/play/multiplayer', game.id]);
                    }

                    // Si la partie vient de se terminer, rediriger automatiquement après 5 secondes
                    if (game.status === 'finished' && !this.isResigning && this.redirectCountdown === 0) {
                        this.startRedirectCountdown();
                    }
                } else if (this.gameId && !this.isLeavingGame) {
                    // Partie supprimée - revenir au lobby
                    this.backToLobby();
                }
            })
        );
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
            const gameId = await this.multiplayerService.acceptChallenge(challenge.id);
            console.log('Challenge accepted, game created:', gameId);
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
        return (playerInfo?.color as 'white' | 'black') || 'white';
    }

    isPlayerTurn(): boolean {
        const playerInfo = this.getCurrentPlayerInfo();
        return playerInfo?.isCurrentTurn || false;
    }

    isGameFinished(): boolean {
        return this.currentGame?.status === 'finished';
    }

    async onMoveChange(move: { from: string; to: string; promotion?: string }): Promise<void> {
        if (!this.gameId || !this.currentGame) return;

        try {
            await this.multiplayerService.makeMove(this.gameId, move);
        } catch (error) {
            console.error('Error making move:', error);
            this.currentPosition.set(this.currentGame.currentFen);
        }
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
        this.multiplayerService.leaveGame();
        this.gameId = null;
        this.currentGame = null;
        this.router.navigate(['/play']);
    }

    private startRedirectCountdown() {
        this.redirectCountdown = 5;
        this.redirectTimer = setInterval(() => {
            this.redirectCountdown--;
            if (this.redirectCountdown === 0) {
                this.backToLobby();
                clearInterval(this.redirectTimer);
            }
        }, 1000);
    }

    cancelRedirect() {
        if (this.redirectTimer) {
            clearInterval(this.redirectTimer);
            this.redirectCountdown = 0;
        }
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
} 