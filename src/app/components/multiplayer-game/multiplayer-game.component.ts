import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MultiplayerService } from '../../services/multiplayer.service';
import { AuthService } from '../../services/auth.service';
import { GameState } from '../../models/game.model';
import { EchiquierComponent } from '../../echiquier/echiquier.component';
import { BoardWrapperComponent } from '../../board-wrapper/board-wrapper.component';
import { ClassicBoardComponent } from '../../backgrounds/classic-board/classic-board.component';
import { HeatmapBoardComponent } from '../../backgrounds/heatmap-board/heatmap-board.component';
import { TopographicBoardComponent } from '../../backgrounds/topographic-board/topographic-board.component';
import { Chess } from 'chess.js';

type BackgroundType = 'classic' | 'heatmap' | 'topographic';

@Component({
  selector: 'app-multiplayer-game',
  standalone: true,
  imports: [
    CommonModule,
    EchiquierComponent,
    BoardWrapperComponent,
    ClassicBoardComponent,
    HeatmapBoardComponent,
    TopographicBoardComponent
  ],
  templateUrl: './multiplayer-game.component.html',
  styleUrl: './multiplayer-game.component.scss'
})
export class MultiplayerGameComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private multiplayerService = inject(MultiplayerService);
  public authService = inject(AuthService);

  // Signal pour synchroniser la position
  currentPosition = signal('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

  // Signal pour le background sélectionné
  selectedBackground = signal<BackgroundType>('classic');

  // Signal pour la luminosité de l'échiquier (0 = noir, 100 = blanc)
  brightness = signal(50);

  gameId: string | null = null;
  currentGame: GameState | null = null;
  isResigning = false;
  redirectCountdown = 0;
  private isLeavingGame = false; // Garde pour éviter la boucle infinie

  private subscriptions: Subscription[] = [];
  private redirectTimer: any = null;

  ngOnInit() {
    this.gameId = this.route.snapshot.paramMap.get('gameId');

    if (!this.gameId) {
      this.backToLobby();
      return;
    }

    // Écouter la partie multijoueur
    this.multiplayerService.listenToGame(this.gameId);

    this.subscriptions.push(
      this.multiplayerService.currentGame$.subscribe(game => {
        this.currentGame = game;
        if (game) {
          this.currentPosition.set(game.currentFen);

          // Si la partie vient de se terminer, rediriger automatiquement après 5 secondes
          if (game.status === 'finished' && !this.isResigning && this.redirectCountdown === 0) {
            this.startRedirectCountdown();
          }
        } else {
          // Partie supprimée ou erreur - SEULEMENT si on n'est pas déjà en train de partir
          if (!this.isLeavingGame) {
            this.backToLobby();
          }
        }
      })
    );
  }

  ngOnDestroy() {
    this.isLeavingGame = true; // S'assurer qu'on évite les boucles au nettoyage
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.redirectTimer) {
      clearInterval(this.redirectTimer);
    }
    this.multiplayerService.leaveGame();
  }

  /**
   * Obtenir les informations du joueur actuel
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

  /**
   * Obtenir les informations de l'adversaire
   */
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

  /**
   * Obtenir le statut de la partie
   */
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

  /**
   * Obtenir le texte de la raison de fin
   */
  private getEndReasonText(): string {
    switch (this.currentGame?.endReason) {
      case 'checkmate': return 'échec et mat';
      case 'stalemate': return 'pat';
      case 'resignation': return 'abandon';
      case 'timeout': return 'temps écoulé';
      default: return 'fin de partie';
    }
  }

  /**
   * Abandonner la partie
   */
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

  /**
   * Retourner au lobby
   */
  backToLobby(): void {
    this.isLeavingGame = true; // Activer la garde
    this.multiplayerService.leaveGame();
    this.router.navigate(['/multiplayer']);
  }

  /**
   * Gérer un coup joué
   */
  async onMoveChange(move: { from: string; to: string; promotion?: string }): Promise<void> {
    console.log('🎮 onMoveChange called with:', move);

    if (!this.gameId || !this.currentGame) {
      console.log('🎮 Missing gameId or currentGame:', { gameId: this.gameId, currentGame: this.currentGame });
      return;
    }

    try {
      console.log('🎮 Sending move to multiplayer service...');
      // Envoyer le coup au service multiplayer
      await this.multiplayerService.makeMove(this.gameId, move);
      console.log('🎮 Move sent successfully!');
    } catch (error) {
      console.error('🎮 Error sending move:', error);
      // En cas d'erreur, forcer la réinitialisation de la position
      this.currentPosition.set(this.currentGame.currentFen);
    }
  }

  /**
   * Gérer le changement de position (gardé pour compatibilité)
   */
  async onPositionChange(newPosition: string): Promise<void> {
    console.log('🎮 onPositionChange called with:', newPosition);

    if (!this.gameId || !this.currentGame) {
      console.log('🎮 Missing gameId or currentGame:', { gameId: this.gameId, currentGame: this.currentGame });
      return;
    }

    console.log('🎮 Current game FEN:', this.currentGame.currentFen);
    console.log('🎮 New position FEN:', newPosition);

    // Créer une instance Chess temporaire pour extraire le dernier coup
    const tempChess = new Chess(this.currentGame.currentFen);
    const newChess = new Chess(newPosition);

    // Obtenir l'historique des coups
    const oldHistory = tempChess.history({ verbose: true });
    const newHistory = newChess.history({ verbose: true });

    console.log('🎮 Old history length:', oldHistory.length);
    console.log('🎮 New history length:', newHistory.length);

    // Le dernier coup est la différence entre les deux historiques
    if (newHistory.length > oldHistory.length) {
      const lastMove = newHistory[newHistory.length - 1];
      console.log('🎮 Last move detected:', lastMove);

      try {
        console.log('🎮 Sending move to multiplayer service...');
        // Envoyer le coup au service multiplayer
        await this.multiplayerService.makeMove(this.gameId, {
          from: lastMove.from,
          to: lastMove.to,
          promotion: lastMove.promotion
        });
        console.log('🎮 Move sent successfully!');
      } catch (error) {
        console.error('🎮 Error sending move:', error);
        // Remettre la position précédente en cas d'erreur
        this.currentPosition.set(this.currentGame.currentFen);
      }
    } else {
      console.log('🎮 No new move detected');
    }
  }

  /**
   * Vérifier si c'est le tour du joueur
   */
  isPlayerTurn(): boolean {
    const playerInfo = this.getCurrentPlayerInfo();
    return playerInfo?.isCurrentTurn || false;
  }

  /**
   * Vérifier si la partie est terminée
   */
  isGameFinished(): boolean {
    return this.currentGame?.status === 'finished';
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

  /**
   * Annuler la redirection automatique
   */
  cancelRedirect() {
    if (this.redirectTimer) {
      clearInterval(this.redirectTimer);
      this.redirectTimer = null;
    }
    this.redirectCountdown = 0;
  }

  /**
   * Changer le mode d'affichage de l'échiquier
   */
  setBackground(background: BackgroundType): void {
    this.selectedBackground.set(background);
  }

  setBrightness(value: number): void {
    this.brightness.set(value);
  }

  getBoardBackgroundColor(): string {
    const brightnessValue = this.brightness();
    // Convertir la valeur 0-100 en couleur RGB (0,0,0) à (255,255,255)
    const rgbValue = Math.round((brightnessValue / 100) * 255);
    return `rgb(${rgbValue}, ${rgbValue}, ${rgbValue})`;
  }

  /**
   * Obtenir l'orientation de l'échiquier selon la couleur du joueur
   */
  getBoardOrientation(): 'white' | 'black' {
    const playerInfo = this.getCurrentPlayerInfo();
    return (playerInfo?.color as 'white' | 'black') || 'white';
  }
}
