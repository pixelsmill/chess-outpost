import { Injectable } from '@angular/core';
import { Chess, Square } from 'chess.js';

export interface PositionEvaluation {
    // Évaluation matérielle (non relative) - somme des points sur l'échiquier
    materialBalance: { white: number; black: number };

    // Prise d'espace - nombre d'espaces sous chacun des pions jusqu'au bord
    spaceControl: { white: number; black: number };

    // Activité des pièces - nombre de déplacements possibles (hors pions et roi)
    pieceActivity: { white: number; black: number };

    // Sécurité du roi - présence de 3 pions à leur position initiale devant le roi
    kingSafety: { white: number; black: number };

    // Structure de pions - nombre d'îlots de pions
    pawnStructure: { white: number; black: number };
}

@Injectable({
    providedIn: 'root'
})
export class PositionEvaluatorService {

    private readonly PIECE_VALUES = {
        'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0
    };

    constructor() { }

    /**
     * Évalue une position complète
     */
    evaluatePosition(position: string): PositionEvaluation {
        const chess = new Chess();
        chess.load(position);

        return {
            materialBalance: this.evaluateMaterialBalance(chess),
            spaceControl: this.evaluateSpaceControl(chess),
            pieceActivity: this.evaluatePieceActivity(chess),
            kingSafety: this.evaluateKingSafety(chess),
            pawnStructure: this.evaluatePawnStructure(chess)
        };
    }

    /**
     * Évalue l'équilibre matériel - somme des points sur l'échiquier
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
     * Évalue la prise d'espace - nombre d'espaces sous chacun des pions jusqu'au bord
     */
    private evaluateSpaceControl(chess: Chess): { white: number; black: number } {
        let whiteSpace = 0;
        let blackSpace = 0;

        const board = chess.board();
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const piece = board[i][j];
                if (piece && piece.type === 'p') {
                    const rank = 8 - i; // rang réel (1-8)

                    if (piece.color === 'w') {
                        // Blancs: compter toutes les cases jusqu'au rang 1 (leur bord)
                        whiteSpace += (rank - 1);
                    } else {
                        // Noirs: compter toutes les cases jusqu'au rang 8 (leur bord)  
                        blackSpace += (8 - rank);
                    }
                }
            }
        }

        return { white: whiteSpace, black: blackSpace };
    }

    /**
     * Évalue l'activité des pièces - nombre de déplacements possibles (hors pions et roi)
     */
    private evaluatePieceActivity(chess: Chess): { white: number; black: number } {
        // Sauvegarder la position originale
        const originalFen = chess.fen();
        const currentTurn = chess.turn();

        let whiteActivity = 0;
        let blackActivity = 0;

        // Calculer l'activité des blancs
        if (currentTurn === 'w') {
            whiteActivity = this.countLegalMoves(chess, 'w');
            // Changer le tour pour les noirs
            chess.load(originalFen.replace(' w ', ' b '));
            blackActivity = this.countLegalMoves(chess, 'b');
        } else {
            blackActivity = this.countLegalMoves(chess, 'b');
            // Changer le tour pour les blancs
            chess.load(originalFen.replace(' b ', ' w '));
            whiteActivity = this.countLegalMoves(chess, 'w');
        }

        // Restaurer la position originale
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
     * Évalue la sécurité du roi - présence de 3 pions à leur position initiale devant le roi
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

        if (color === 'w') {
            // Pour les blancs : chercher les pions blancs devant le roi (rang supérieur)
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
            // Pour les noirs : chercher les pions noirs devant le roi (rang inférieur)
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

        // Ajouter les 3 colonnes autour du roi (ou moins si au bord)
        for (let file = Math.max(0, kingFile - 1); file <= Math.min(7, kingFile + 1); file++) {
            squares.push(String.fromCharCode('a'.charCodeAt(0) + file) + rank);
        }

        return squares;
    }

    /**
     * Évalue la structure de pions - nombre d'îlots de pions
     */
    private evaluatePawnStructure(chess: Chess): { white: number; black: number } {
        const whiteIslands = this.countPawnIslands(chess, 'w');
        const blackIslands = this.countPawnIslands(chess, 'b');

        return { white: whiteIslands, black: blackIslands };
    }

    private countPawnIslands(chess: Chess, color: 'w' | 'b'): number {
        const board = chess.board();
        const pawnFiles: boolean[] = new Array(8).fill(false);

        // Marquer les colonnes qui ont des pions
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const piece = board[i][j];
                if (piece && piece.type === 'p' && piece.color === color) {
                    pawnFiles[j] = true;
                }
            }
        }

        // Compter les îlots (groupes de colonnes adjacentes avec des pions)
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