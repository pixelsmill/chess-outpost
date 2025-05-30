import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MultiplayerService } from '../../services/multiplayer.service';
import { AuthService } from '../../services/auth.service';
import { OnlinePlayer, GameState, Challenge } from '../../models/game.model';
import { Subscription } from 'rxjs';
import { User } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-multiplayer-lobby',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './multiplayer-lobby.component.html',
    styleUrls: ['./multiplayer-lobby.component.scss']
})
export class MultiplayerLobbyComponent implements OnInit, OnDestroy {
    private multiplayerService = inject(MultiplayerService);
    private authService = inject(AuthService);
    private router = inject(Router);

    user$: Observable<User | null> = this.authService.user$;
    onlinePlayers: OnlinePlayer[] = [];
    currentGame: GameState | null = null;
    challenges: Challenge[] = [];

    // États de chargement
    isQuickMatching = false;
    challengingPlayer: string | null = null;
    isRedirecting = false;

    private subscriptions: Subscription[] = [];

    ngOnInit() {
        // Charger les données seulement si l'utilisateur est connecté
        this.user$.subscribe(user => {
            if (user) {
                this.loadOnlinePlayers();
                this.loadChallenges();
                this.listenToCurrentGame();
            }
        });
    }

    ngOnDestroy() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    /**
     * Écouter les joueurs en ligne
     */
    private loadOnlinePlayers(): void {
        this.subscriptions.push(
            this.multiplayerService.onlinePlayers$.subscribe(players => {
                this.onlinePlayers = players;
            })
        );
    }

    /**
     * Écouter les défis reçus
     */
    private loadChallenges(): void {
        this.subscriptions.push(
            this.multiplayerService.challenges$.subscribe(challenges => {
                this.challenges = challenges;
            })
        );
    }

    /**
     * Écouter la partie en cours pour redirection automatique
     */
    private listenToCurrentGame(): void {
        this.subscriptions.push(
            this.multiplayerService.currentGame$.subscribe((game: GameState | null) => {
                this.currentGame = game;
                if (game && !this.isRedirecting) {
                    this.isRedirecting = true;
                    console.log('Redirection vers la partie:', game.id);
                    this.router.navigate(['/play/game', game.id]);
                }
            })
        );
    }

    /**
     * Se connecter avec Google
     */
    async signInWithGoogle() {
        try {
            await this.authService.loginWithGoogle();
        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
        }
    }

    /**
     * Défier un joueur
     */
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

    /**
     * Accepter un défi
     */
    async acceptChallenge(challenge: Challenge) {
        try {
            const gameId = await this.multiplayerService.acceptChallenge(challenge.id);
            console.log('Défi accepté, partie créée:', gameId);
        } catch (error) {
            console.error('Erreur lors de l\'acceptation du défi:', error);
        }
    }

    /**
     * Refuser un défi
     */
    async declineChallenge(challenge: Challenge) {
        try {
            await this.multiplayerService.declineChallenge(challenge.id);
        } catch (error) {
            console.error('Erreur lors du refus du défi:', error);
        }
    }

    /**
     * Lancer une partie rapide
     */
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

    /**
     * Obtenir le statut d'un joueur
     */
    getStatusLabel(status: string): string {
        switch (status) {
            case 'available': return 'Disponible';
            case 'playing': return 'En partie';
            case 'away': return 'Absent';
            default: return 'Inconnu';
        }
    }

    /**
     * Obtenir la couleur du statut
     */
    getStatusColor(status: string): string {
        switch (status) {
            case 'available': return '#4ade80';
            case 'playing': return '#f59e0b';
            case 'away': return '#ef4444';
            default: return '#6b7280';
        }
    }

    /**
     * Retourner à l'accueil
     */
    goHome() {
        this.router.navigate(['/']);
    }
} 