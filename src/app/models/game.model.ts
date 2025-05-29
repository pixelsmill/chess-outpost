export interface Player {
    uid: string;
    displayName: string;
    photoURL?: string;
    color: 'white' | 'black';
}

export interface OnlinePlayer {
    uid: string;
    displayName: string;
    photoURL?: string;
    status: 'available' | 'playing' | 'away';
    lastSeen: number;
}

export interface GameMove {
    from: string;
    to: string;
    piece: string;
    san: string; // Standard Algebraic Notation
    fen: string; // Position après le coup
    timestamp: number;
    playerUid: string;
}

export interface GameState {
    id: string;
    players: {
        white: Player;
        black: Player;
    };
    status: 'waiting' | 'active' | 'finished' | 'abandoned';
    currentTurn: 'white' | 'black';
    moves: GameMove[];
    currentFen: string;
    createdAt: number;
    updatedAt: number;
    winner?: 'white' | 'black' | 'draw';
    endReason?: 'checkmate' | 'stalemate' | 'resignation' | 'draw_agreement' | 'timeout';
}

export interface Challenge {
    id: string;
    from: OnlinePlayer;
    to: OnlinePlayer;
    status: 'pending' | 'accepted' | 'declined' | 'expired';
    createdAt: number;
    gameId?: string;
} 