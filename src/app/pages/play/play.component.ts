import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs';
import { User } from '@angular/fire/auth';

// Services
import { MultiplayerService } from '../../services/multiplayer.service';
import { AuthService } from '../../services/auth.service';

// Models
import { OnlinePlayer, GameState, Challenge } from '../../models/game.model';

// Components
import { EchiquierComponent } from '../../echiquier/echiquier.component';
import { BoardWrapperComponent } from '../../board-wrapper/board-wrapper.component';
import { HeatmapBoardComponent } from '../../backgrounds/heatmap-board/heatmap-board.component';
import { TopographicBoardComponent } from '../../backgrounds/topographic-board/topographic-board.component';

type BackgroundType = 'heatmap' | 'topographic';

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
export class PlayComponent implements OnInit, OnDestroy {
    private multiplayerService = inject(MultiplayerService);
    authService = inject(AuthService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    // Signaux pour l'échiquier
    selectedBackground = signal<BackgroundType>('heatmap');
    brightness = signal<number>(25);
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
    }

    /**
     * Méthodes pour l'échiquier
     */
    setBackground(background: BackgroundType): void {
        this.selectedBackground.set(background);
    }

    getBoardBackgroundColor(): string {
        return `rgba(0, 0, 0, ${(100 - this.brightness()) / 100})`;
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
            console.log('Partie rapide lancée:', challengeId);
        } catch (error) {
            console.error('Erreur lors de la partie rapide:', error);
            alert('Aucun joueur disponible pour le moment');
        } finally {
            this.isQuickMatching = false;
        }
    }

    async challengePlayer(player: OnlinePlayer) {
        this.challengingPlayer = player.uid;
        try {
            const challengeId = await this.multiplayerService.challengePlayer(player);
            console.log('Défi envoyé:', challengeId);
        } catch (error) {
            console.error('Erreur lors du défi:', error);
        } finally {
            this.challengingPlayer = null;
        }
    }

    async acceptChallenge(challenge: Challenge) {
        try {
            const gameId = await this.multiplayerService.acceptChallenge(challenge.id);
            console.log('Défi accepté, partie créée:', gameId);
        } catch (error) {
            console.error('Erreur lors de l\'acceptation du défi:', error);
        }
    }

    async declineChallenge(challenge: Challenge) {
        try {
            await this.multiplayerService.declineChallenge(challenge.id);
        } catch (error) {
            console.error('Erreur lors du refus du défi:', error);
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
        if (!this.currentGame) return 'Chargement...';

        const playerInfo = this.getCurrentPlayerInfo();
        if (!playerInfo) return 'Erreur';

        if (this.currentGame.status === 'finished') {
            if (this.currentGame.winner === 'draw') {
                return `Match nul (${this.getEndReasonText()})`;
            } else if (this.currentGame.winner === playerInfo.color) {
                return `Vous avez gagné ! (${this.getEndReasonText()})`;
            } else {
                return `Vous avez perdu (${this.getEndReasonText()})`;
            }
        }

        return playerInfo.isCurrentTurn ? 'À votre tour' : 'Tour de l\'adversaire';
    }

    private getEndReasonText(): string {
        if (!this.currentGame) return '';

        switch (this.currentGame.endReason) {
            case 'checkmate': return 'Mat';
            case 'resignation': return 'Abandon';
            case 'timeout': return 'Temps écoulé';
            case 'stalemate': return 'Pat';
            case 'draw_agreement': return 'Nulle';
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
            console.error('Erreur lors du coup:', error);
            this.currentPosition.set(this.currentGame.currentFen);
        }
    }

    async resignGame(): Promise<void> {
        if (!this.gameId || this.isResigning) return;

        const confirmResign = confirm('Êtes-vous sûr de vouloir abandonner cette partie ?');
        if (!confirmResign) return;

        this.isResigning = true;
        try {
            await this.multiplayerService.resignGame(this.gameId);
        } catch (error) {
            console.error('Erreur lors de l\'abandon:', error);
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
            case 'available': return 'Disponible';
            case 'in_game': return 'En partie';
            case 'away': return 'Absent';
            default: return 'Hors ligne';
        }
    }

    goHome(): void {
        this.router.navigate(['/']);
    }
} 