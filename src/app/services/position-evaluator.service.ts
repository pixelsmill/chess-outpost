import { Injectable } from '@angular/core';
import { Chess, Square } from 'chess.js';

export interface NormalizedEvaluation {
    raw: { white: number; black: number };
    percentage: number;  // -100 à +100, >0 = avantage blanc, <0 = avantage noir
}

export interface PositionEvaluation {
    materialBalance: NormalizedEvaluation;
    spaceControl: NormalizedEvaluation;
    pieceActivity: NormalizedEvaluation;
    kingSafety: NormalizedEvaluation;
    pawnStructure: NormalizedEvaluation;
}

@Injectable({
    providedIn: 'root'
})
export class PositionEvaluatorService {

    private readonly PIECE_VALUES = {
        'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0
    };

    // Seuils pour l'amplification des pourcentages
    private readonly THRESHOLDS = {
        materialBalance: 4,  // 4 points d'écart = amplification maximale
        spaceControl: 6,    // 6 cases d'écart = amplification maximale
        pieceActivity: 8,   // 8 coups d'écart = amplification maximale
        kingSafety: 4,      // 4 points d'écart = amplification maximale (inclut bonus ailes)
        pawnStructure: 3    // 3 îlots d'écart = amplification maximale
    };

    constructor() { }

    /**
     * Évalue une position complète avec des métriques normalisées
     */
    evaluatePosition(position: string): PositionEvaluation {
        const chess = new Chess();
        chess.load(position);

        const rawMaterial = this.evaluateMaterialBalance(chess);
        const rawSpace = this.evaluateSpaceControl(chess);
        const rawActivity = this.evaluatePieceActivity(chess);
        const rawSafety = this.evaluateKingSafety(chess);
        const rawStructure = this.evaluatePawnStructure(chess);

        return {
            materialBalance: this.normalizeEvaluation(rawMaterial, 'materialBalance'),
            spaceControl: this.normalizeEvaluation(rawSpace, 'spaceControl'),
            pieceActivity: this.normalizeEvaluation(rawActivity, 'pieceActivity'),
            kingSafety: this.normalizeEvaluation(rawSafety, 'kingSafety'),
            pawnStructure: this.normalizeEvaluation(rawStructure, 'pawnStructure', true) // true = inversé (moins = mieux)
        };
    }

    /**
     * Normalise une évaluation brute en pourcentage
     */
    private normalizeEvaluation(
        raw: { white: number; black: number },
        metric: keyof typeof this.THRESHOLDS,
        isInverted: boolean = false
    ): NormalizedEvaluation {
        let whiteValue = raw.white;
        let blackValue = raw.black;

        if (isInverted) {
            // Pour les métriques où moins = mieux (comme la structure de pions)
            whiteValue = blackValue;
            blackValue = raw.white;
        }

        const total = whiteValue + blackValue;
        let percentage = total === 0 ? 0 : ((whiteValue - blackValue) / total) * 100;

        // Amplification basée sur la différence
        const diff = Math.abs(whiteValue - blackValue);
        const threshold = this.THRESHOLDS[metric];

        if (diff > 0) {
            const amplificationFactor = 1 + (diff / threshold);
            percentage = Math.max(-100, Math.min(100, percentage * amplificationFactor));
        }

        return { raw, percentage };
    }

    /**
     * Évalue l'équilibre matériel
     */
    private evaluateMaterialBalance(chess: Chess): { white: number; black: number } {
        let whitePoints = 0;
        let blackPoints = 0;

        const board = chess.board();
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const piece = board[i][j];
                if (piece) {
                    const value = this.PIECE_VALUES[piece.type as keyof typeof this.PIECE_VALUES];
                    if (piece.color === 'w') {
                        whitePoints += value;
                    } else {
                        blackPoints += value;
                    }
                }
            }
        }

        return { white: whitePoints, black: blackPoints };
    }

    /**
     * Évalue le contrôle de l'espace
     */
    private evaluateSpaceControl(chess: Chess): { white: number; black: number } {
        let whiteSpace = 0;
        let blackSpace = 0;

        const board = chess.board();
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const piece = board[i][j];
                if (piece && piece.type === 'p') {
                    const rank = 8 - i;
                    if (piece.color === 'w') {
                        whiteSpace += (rank - 1);
                    } else {
                        blackSpace += (8 - rank);
                    }
                }
            }
        }

        return { white: whiteSpace, black: blackSpace };
    }

    /**
     * Évalue l'activité des pièces
     */
    private evaluatePieceActivity(chess: Chess): { white: number; black: number } {
        const originalFen = chess.fen();
        const currentTurn = chess.turn();

        let whiteActivity = 0;
        let blackActivity = 0;

        if (currentTurn === 'w') {
            whiteActivity = this.countLegalMoves(chess, 'w');
            chess.load(originalFen.replace(' w ', ' b '));
            blackActivity = this.countLegalMoves(chess, 'b');
        } else {
            blackActivity = this.countLegalMoves(chess, 'b');
            chess.load(originalFen.replace(' b ', ' w '));
            whiteActivity = this.countLegalMoves(chess, 'w');
        }

        chess.load(originalFen);
        return { white: whiteActivity, black: blackActivity };
    }

    private countLegalMoves(chess: Chess, color: 'w' | 'b'): number {
        const moves = chess.moves({ verbose: true });
        let count = 0;

        moves.forEach(move => {
            const piece = chess.get(move.from as Square);
            if (piece && piece.type !== 'p' && piece.type !== 'k' && piece.color === color) {
                count++;
            }
        });

        return count;
    }

    /**
     * Évalue la sécurité du roi
     */
    private evaluateKingSafety(chess: Chess): { white: number; black: number } {
        const whiteSafety = this.checkKingSafety(chess, 'w');
        const blackSafety = this.checkKingSafety(chess, 'b');

        return { white: whiteSafety, black: blackSafety };
    }

    private checkKingSafety(chess: Chess, color: 'w' | 'b'): number {
        const kingSquare = this.findKingSquare(chess, color);
        if (!kingSquare) return 0;

        const kingFile = kingSquare.charCodeAt(0) - 'a'.charCodeAt(0);
        const kingRank = parseInt(kingSquare[1]);
        let safetyCount = 0;

        // Bonus pour roi sur colonnes des ailes (a=0, b=1, c=2, g=6, h=7)
        if (kingFile <= 2 || kingFile >= 6) {
            safetyCount += 1;
        }

        if (color === 'w') {
            const protectorRank = kingRank + 1;
            if (protectorRank <= 8) {
                const protectorSquares = this.getProtectorSquares(kingFile, protectorRank);
                protectorSquares.forEach(square => {
                    const piece = chess.get(square as Square);
                    if (piece && piece.type === 'p' && piece.color === 'w') {
                        safetyCount++;
                    }
                });
            }
        } else {
            const protectorRank = kingRank - 1;
            if (protectorRank >= 1) {
                const protectorSquares = this.getProtectorSquares(kingFile, protectorRank);
                protectorSquares.forEach(square => {
                    const piece = chess.get(square as Square);
                    if (piece && piece.type === 'p' && piece.color === 'b') {
                        safetyCount++;
                    }
                });
            }
        }

        return safetyCount;
    }

    private getProtectorSquares(kingFile: number, rank: number): string[] {
        const squares: string[] = [];
        for (let file = Math.max(0, kingFile - 1); file <= Math.min(7, kingFile + 1); file++) {
            squares.push(String.fromCharCode('a'.charCodeAt(0) + file) + rank);
        }
        return squares;
    }

    /**
     * Évalue la structure de pions
     */
    private evaluatePawnStructure(chess: Chess): { white: number; black: number } {
        const whiteIslands = this.countPawnIslands(chess, 'w');
        const blackIslands = this.countPawnIslands(chess, 'b');

        return { white: whiteIslands, black: blackIslands };
    }

    private countPawnIslands(chess: Chess, color: 'w' | 'b'): number {
        const board = chess.board();
        const pawnFiles: boolean[] = new Array(8).fill(false);

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const piece = board[i][j];
                if (piece && piece.type === 'p' && piece.color === color) {
                    pawnFiles[j] = true;
                }
            }
        }

        let islands = 0;
        let inIsland = false;

        for (let file = 0; file < 8; file++) {
            if (pawnFiles[file]) {
                if (!inIsland) {
                    islands++;
                    inIsland = true;
                }
            } else {
                inIsland = false;
            }
        }

        return islands;
    }

    private findKingSquare(chess: Chess, color: 'w' | 'b'): string | null {
        const board = chess.board();
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const piece = board[i][j];
                if (piece && piece.type === 'k' && piece.color === color) {
                    return String.fromCharCode('a'.charCodeAt(0) + j) + (8 - i);
                }
            }
        }
        return null;
    }
}