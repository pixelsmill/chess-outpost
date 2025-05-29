import { Injectable, inject } from '@angular/core';
import { Database, ref, push, set, onValue, off } from '@angular/fire/database';
import { AuthService } from './auth.service';
import { GameState, OnlinePlayer, GameMove, Challenge } from '../models/game.model';
import { BehaviorSubject, timer } from 'rxjs';
// import { Chess } from 'chess.js'; // Temporairement commenté

@Injectable({
    providedIn: 'root'
})
export class MultiplayerService {
    private database = inject(Database);
    private authService = inject(AuthService);

    private currentGameSubject = new BehaviorSubject<GameState | null>(null);
    public currentGame$ = this.currentGameSubject.asObservable();

    private onlinePlayersSubject = new BehaviorSubject<OnlinePlayer[]>([]);
    public onlinePlayers$ = this.onlinePlayersSubject.asObservable();

    private challengesSubject = new BehaviorSubject<Challenge[]>([]);
    public challenges$ = this.challengesSubject.asObservable();

    // Changement : stocker les fonctions de nettoyage au lieu des listeners
    private playersUnsubscribe: (() => void) | null = null;
    private gameUnsubscribe: (() => void) | null = null;
    private challengesUnsubscribe: (() => void) | null = null;
    private presenceRef: any = null;

    constructor() {
        this.initializePresence();
        this.listenToOnlinePlayers();
        this.listenToChallenges();
        this.listenToUserGames();
    }

    /**
     * Initialiser la présence
     */
    private initializePresence(): void {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) return;

        const playerData: any = {
            uid: currentUser.uid,
            displayName: currentUser.displayName || 'Joueur',
            status: 'available',
            lastSeen: Date.now()
        };

        if (currentUser.photoURL) {
            playerData.photoURL = currentUser.photoURL;
        }

        this.presenceRef = ref(this.database, `onlinePlayers/${currentUser.uid}`);
        set(this.presenceRef, playerData);

        // Heartbeat
        setInterval(() => {
            if (this.presenceRef) {
                set(ref(this.database, `onlinePlayers/${currentUser.uid}/lastSeen`), Date.now());
            }
        }, 30000);
    }

    /**
     * Écouter les joueurs en ligne
     */
    private listenToOnlinePlayers(): void {
        const playersRef = ref(this.database, 'onlinePlayers');

        this.playersUnsubscribe = onValue(playersRef, (snapshot) => {
            const players: OnlinePlayer[] = [];
            const currentUser = this.authService.getCurrentUser();

            if (snapshot.exists()) {
                const data = snapshot.val();
                const now = Date.now();

                Object.keys(data).forEach(uid => {
                    const player = data[uid] as OnlinePlayer;

                    if (uid !== currentUser?.uid && (now - player.lastSeen) < 120000) {
                        players.push({ ...player, uid });
                    }
                });
            }

            this.onlinePlayersSubject.next(players);
        });
    }

    /**
     * Défier un joueur
     */
    async challengePlayer(targetPlayer: OnlinePlayer): Promise<string> {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) throw new Error('Utilisateur non connecté');

        const challengeData: any = {
            from: {
                uid: currentUser.uid,
                displayName: currentUser.displayName || 'Joueur',
                status: 'available',
                lastSeen: Date.now()
            },
            to: targetPlayer,
            status: 'pending',
            createdAt: Date.now()
        };

        if (currentUser.photoURL) {
            challengeData.from.photoURL = currentUser.photoURL;
        }

        const challengesRef = ref(this.database, 'challenges');
        const newChallengeRef = push(challengesRef);
        await set(newChallengeRef, challengeData);

        return newChallengeRef.key!;
    }

    /**
     * Partie rapide
     */
    async quickMatch(): Promise<string> {
        const availablePlayers = this.onlinePlayersSubject.value.filter(p => p.status === 'available');

        if (availablePlayers.length === 0) {
            throw new Error('Aucun joueur disponible');
        }

        const randomPlayer = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
        return this.challengePlayer(randomPlayer);
    }

    /**
     * Accepter un défi
     */
    async acceptChallenge(challengeId: string): Promise<string> {
        // Récupérer le défi
        const challengeRef = ref(this.database, `challenges/${challengeId}`);

        return new Promise((resolve, reject) => {
            onValue(challengeRef, async (snapshot) => {
                if (snapshot.exists()) {
                    const challenge = snapshot.val() as Challenge;

                    // Créer la partie
                    const gameId = await this.createGameFromChallenge(challenge);

                    // Supprimer le défi
                    await set(challengeRef, null);

                    resolve(gameId);
                } else {
                    reject(new Error('Défi introuvable'));
                }
            }, { onlyOnce: true });
        });
    }

    /**
     * Refuser un défi
     */
    async declineChallenge(challengeId: string): Promise<void> {
        const challengeRef = ref(this.database, `challenges/${challengeId}`);
        await set(challengeRef, null);
    }

    /**
     * Créer une partie à partir d'un défi
     */
    private async createGameFromChallenge(challenge: Challenge): Promise<string> {
        // const chess = new Chess();
        const isFromWhite = Math.random() > 0.5;

        const gameData: any = {
            players: {
                white: {
                    uid: isFromWhite ? challenge.from.uid : challenge.to.uid,
                    displayName: isFromWhite ? challenge.from.displayName : challenge.to.displayName,
                    color: 'white'
                },
                black: {
                    uid: isFromWhite ? challenge.to.uid : challenge.from.uid,
                    displayName: isFromWhite ? challenge.to.displayName : challenge.from.displayName,
                    color: 'black'
                }
            },
            status: 'active',
            currentTurn: 'white',
            moves: [],
            currentFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        // Ajouter les photos
        if (isFromWhite && challenge.from.photoURL) {
            gameData.players.white.photoURL = challenge.from.photoURL;
        }
        if (isFromWhite && challenge.to.photoURL) {
            gameData.players.black.photoURL = challenge.to.photoURL;
        }
        if (!isFromWhite && challenge.from.photoURL) {
            gameData.players.black.photoURL = challenge.from.photoURL;
        }
        if (!isFromWhite && challenge.to.photoURL) {
            gameData.players.white.photoURL = challenge.to.photoURL;
        }

        const gamesRef = ref(this.database, 'games');
        const newGameRef = push(gamesRef);
        await set(newGameRef, gameData);

        return newGameRef.key!;
    }

    /**
     * Écouter les défis
     */
    private listenToChallenges(): void {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) return;

        const challengesRef = ref(this.database, 'challenges');

        this.challengesUnsubscribe = onValue(challengesRef, (snapshot) => {
            const challenges: Challenge[] = [];

            if (snapshot.exists()) {
                const data = snapshot.val();

                Object.keys(data).forEach(id => {
                    const challenge = { id, ...data[id] } as Challenge;

                    if (challenge.to.uid === currentUser.uid && challenge.status === 'pending') {
                        challenges.push(challenge);
                    }
                });
            }

            this.challengesSubject.next(challenges);
        });
    }

    /**
     * Écouter une partie
     */
    listenToGame(gameId: string): void {
        console.log('🔍 listenToGame called with gameId:', gameId);

        // Nettoyer le listener précédent de manière sécurisée
        if (this.gameUnsubscribe) {
            console.log('🔍 Removing existing gameListener safely');
            try {
                this.gameUnsubscribe();
            } catch (error) {
                console.warn('🔍 Error removing gameListener:', error);
            }
            this.gameUnsubscribe = null;
        }

        const gameRef = ref(this.database, `games/${gameId}`);
        console.log('🔍 Created gameRef');

        this.gameUnsubscribe = onValue(gameRef, (snapshot) => {
            console.log('🔍 onValue callback triggered');

            if (snapshot.exists()) {
                console.log('🔍 Snapshot exists, getting raw data...');
                const rawData = snapshot.val();
                console.log('🔍 Raw data:', rawData);

                // Nettoyer les données pour éviter les objets chess.js sérialisés
                console.log('🔍 Creating clean game data...');
                const cleanGameData: GameState = {
                    id: gameId,
                    players: rawData.players || {},
                    status: rawData.status || 'active',
                    currentTurn: rawData.currentTurn || 'white',
                    moves: rawData.moves || [],
                    currentFen: rawData.currentFen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
                    createdAt: rawData.createdAt || Date.now(),
                    updatedAt: rawData.updatedAt || Date.now(),
                    winner: rawData.winner,
                    endReason: rawData.endReason
                };

                console.log('🔍 About to call currentGameSubject.next with:', cleanGameData);
                this.currentGameSubject.next(cleanGameData);
                console.log('🔍 currentGameSubject.next completed successfully');
            } else {
                console.log('🔍 Snapshot does not exist, setting to null');
                this.currentGameSubject.next(null);
            }
        });

        console.log('🔍 listenToGame setup completed');
    }

    /**
     * Jouer un coup
     */
    async makeMove(gameId: string, move: { from: string; to: string; promotion?: string }): Promise<boolean> {
        console.log('🎯 makeMove called with:', { gameId, move });

        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) {
            console.log('🎯 Error: User not connected');
            throw new Error('Utilisateur non connecté');
        }

        const currentGame = this.currentGameSubject.value;
        if (!currentGame) {
            console.log('🎯 Error: No current game');
            throw new Error('Aucune partie en cours');
        }

        console.log('🎯 Current game state:', currentGame);

        const playerColor = this.getPlayerColor(currentUser.uid, currentGame);
        console.log('🎯 Player color:', playerColor, 'Current turn:', currentGame.currentTurn);

        if (!playerColor || currentGame.currentTurn !== playerColor) {
            console.log('🎯 Error: Not player turn');
            throw new Error('Ce n\'est pas votre tour');
        }

        // Réactiver Chess.js pour valider le coup et calculer la nouvelle position
        const { Chess } = await import('chess.js');
        const chess = new Chess(currentGame.currentFen);

        console.log('🎯 Attempting move on position:', currentGame.currentFen);

        const moveResult = chess.move({
            from: move.from,
            to: move.to,
            promotion: move.promotion || 'q'
        });

        console.log('🎯 Move result:', moveResult);

        if (!moveResult) {
            console.log('🎯 Error: Invalid move');
            throw new Error('Coup invalide');
        }

        const gameMove: GameMove = {
            from: move.from,
            to: move.to,
            piece: moveResult.piece,
            san: moveResult.san,
            fen: chess.fen(),
            timestamp: Date.now(),
            playerUid: currentUser.uid
        };

        console.log('🎯 Game move object:', gameMove);

        let winner: 'white' | 'black' | 'draw' | undefined;
        let endReason: GameState['endReason'];
        let status: GameState['status'] = 'active';

        // Vérifier la fin de partie
        if (chess.isGameOver()) {
            status = 'finished';
            if (chess.isCheckmate()) {
                winner = currentGame.currentTurn; // Le joueur qui vient de jouer gagne
                endReason = 'checkmate';
            } else if (chess.isStalemate()) {
                winner = 'draw';
                endReason = 'stalemate';
            } else {
                winner = 'draw';
                endReason = 'draw_agreement';
            }
            console.log('🎯 Game over:', { winner, endReason });
        }

        const gameRef = ref(this.database, `games/${gameId}`);

        // Nettoyer currentGame pour enlever les undefined
        const cleanCurrentGame = { ...currentGame };
        if (cleanCurrentGame.winner === undefined) delete cleanCurrentGame.winner;
        if (cleanCurrentGame.endReason === undefined) delete cleanCurrentGame.endReason;

        const updates: any = {
            ...cleanCurrentGame,
            moves: [...(currentGame?.moves || []), gameMove],
            currentFen: chess.fen(), // Position après le coup
            currentTurn: currentGame?.currentTurn === 'white' ? 'black' : 'white',
            updatedAt: Date.now(),
            status
        };

        // Ajouter winner et endReason seulement s'ils ont une valeur
        if (winner !== undefined) {
            updates.winner = winner;
        }
        if (endReason !== undefined) {
            updates.endReason = endReason;
        }

        console.log('🎯 Updating Firebase with:', updates);

        try {
            await set(gameRef, updates);
            console.log('✅ 🎯 Firebase update successful! Move synchronized!');
            return true;
        } catch (error) {
            console.error('❌ 🎯 Firebase update failed:', error);
            throw error;
        }
    }

    private getPlayerColor(playerUid: string, game: GameState): 'white' | 'black' | null {
        if (game.players.white.uid === playerUid) return 'white';
        if (game.players.black.uid === playerUid) return 'black';
        return null;
    }

    async resignGame(gameId: string): Promise<void> {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) return;

        const currentGame = this.currentGameSubject.value;
        if (!currentGame) return;

        const playerColor = this.getPlayerColor(currentUser.uid, currentGame);
        const winner = playerColor === 'white' ? 'black' : 'white';

        const gameRef = ref(this.database, `games/${gameId}`);
        await set(gameRef, {
            ...currentGame,
            status: 'finished',
            winner,
            endReason: 'resignation',
            updatedAt: Date.now()
        });
    }

    leaveGame(): void {
        if (this.gameUnsubscribe) {
            try {
                this.gameUnsubscribe();
            } catch (error) {
                console.warn('Error removing gameListener in leaveGame:', error);
            }
            this.gameUnsubscribe = null;
        }
        this.currentGameSubject.next(null);
    }

    async goOffline(): Promise<void> {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) return;

        const playerRef = ref(this.database, `onlinePlayers/${currentUser.uid}`);
        await set(playerRef, null);
    }

    ngOnDestroy(): void {
        try {
            if (this.playersUnsubscribe) this.playersUnsubscribe();
        } catch (error) {
            console.warn('Error removing playersListener:', error);
        }

        try {
            if (this.gameUnsubscribe) this.gameUnsubscribe();
        } catch (error) {
            console.warn('Error removing gameListener:', error);
        }

        try {
            if (this.challengesUnsubscribe) this.challengesUnsubscribe();
        } catch (error) {
            console.warn('Error removing challengesListener:', error);
        }

        this.goOffline();
    }

    /**
     * Écouter les parties où l'utilisateur actuel est joueur
     */
    private listenToUserGames(): void {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) return;

        const gamesRef = ref(this.database, 'games');

        onValue(gamesRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();

                // Chercher s'il y a une nouvelle partie pour l'utilisateur
                Object.keys(data).forEach(gameId => {
                    const game = { id: gameId, ...data[gameId] } as GameState;

                    // Si l'utilisateur est dans cette partie et qu'elle vient d'être créée (moins de 10 secondes)
                    const isPlayerInGame = game.players?.white?.uid === currentUser.uid ||
                        game.players?.black?.uid === currentUser.uid;
                    const isRecentGame = (Date.now() - game.createdAt) < 10000; // 10 secondes

                    if (isPlayerInGame && isRecentGame && game.status === 'active') {
                        // Éviter les redirections multiples
                        const currentGame = this.currentGameSubject.value;
                        if (!currentGame || currentGame.id !== gameId) {
                            console.log('Nouvelle partie détectée pour l\'utilisateur:', gameId);
                            timer(500).subscribe(() => {
                                this.listenToGame(gameId);
                            });
                        }
                    }
                });
            }
        });
    }
} 