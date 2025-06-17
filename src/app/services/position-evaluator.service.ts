import { Injectable } from '@angular/core';
import { Chess, Square } from 'chess.js';

export interface PositionEvaluation {
    // Sécurité du roi
    kingPawnShield: number;
    kingExposedInCenter: number;
    openLinesAgainstKing: number;
    kingCastlingSafety: number;
    kingEscapeSquares: number;
    attackersVsDefenders: number;

    // Rapport matériel
    materialAdvantage: number;
    bishopPair: number;
    lightSquareAdvantage: number;
    darkSquareAdvantage: number;
    queenVsMinorPieces: number;
    rookVsMinorPieces: number;
    exchangeQuality: number;

    // Activité des pièces
    activePieces: number;
    pieceMobility: number;
    pieceCoordination: number;
    rookColumnControl: number;
    overloadedPieces: number;
    badlyPlacedPieces: number;
    bishopVsKnight: number;

    // Prise d'espace
    centerControl: number;
    spaceAdvantage: number;
    weakSquares: number;
    outposts: number;
    holes: number;
    centerTension: number;

    // Structure de pions
    passedPawns: number;
    protectedPassedPawns: number;
    distantPassedPawns: number;
    isolatedPawns: number;
    backwardPawns: number;
    backwardPawnsOnSemiOpen: number;
    pawnMajority: number;
    doubledPawns: number;
    pawnIslands: number;
    hangingPawns: number;
    pawnChains: number;
}

@Injectable({
    providedIn: 'root'
})
export class PositionEvaluatorService {

    constructor() { }

    /**
     * Évalue une position complète
     */
    evaluatePosition(position: string): PositionEvaluation {
        const chess = new Chess();
        chess.load(position);

        return {
            // Sécurité du roi
            kingPawnShield: this.evaluateKingPawnShield(chess),
            kingExposedInCenter: this.evaluateKingExposedInCenter(chess),
            openLinesAgainstKing: this.evaluateOpenLinesAgainstKing(chess),
            kingCastlingSafety: this.evaluateKingCastlingSafety(chess),
            kingEscapeSquares: this.evaluateKingEscapeSquares(chess),
            attackersVsDefenders: this.evaluateAttackersVsDefenders(chess),

            // Rapport matériel
            materialAdvantage: this.evaluateMaterialAdvantage(chess),
            bishopPair: this.evaluateBishopPair(chess),
            lightSquareAdvantage: this.evaluateLightSquareAdvantage(chess),
            darkSquareAdvantage: this.evaluateDarkSquareAdvantage(chess),
            queenVsMinorPieces: this.evaluateQueenVsMinorPieces(chess),
            rookVsMinorPieces: this.evaluateRookVsMinorPieces(chess),
            exchangeQuality: this.evaluateExchangeQuality(chess),

            // Activité des pièces
            activePieces: this.evaluateActivePieces(chess),
            pieceMobility: this.evaluatePieceMobility(chess),
            pieceCoordination: this.evaluatePieceCoordination(chess),
            rookColumnControl: this.evaluateRookColumnControl(chess),
            overloadedPieces: this.evaluateOverloadedPieces(chess),
            badlyPlacedPieces: this.evaluateBadlyPlacedPieces(chess),
            bishopVsKnight: this.evaluateBishopVsKnight(chess),

            // Prise d'espace
            centerControl: this.evaluateCenterControl(chess),
            spaceAdvantage: this.evaluateSpaceAdvantage(chess),
            weakSquares: this.evaluateWeakSquares(chess),
            outposts: this.evaluateOutposts(chess),
            holes: this.evaluateHoles(chess),
            centerTension: this.evaluateCenterTension(chess),

            // Structure de pions
            passedPawns: this.evaluatePassedPawns(chess),
            protectedPassedPawns: this.evaluateProtectedPassedPawns(chess),
            distantPassedPawns: this.evaluateDistantPassedPawns(chess),
            isolatedPawns: this.evaluateIsolatedPawns(chess),
            backwardPawns: this.evaluateBackwardPawns(chess),
            backwardPawnsOnSemiOpen: this.evaluateBackwardPawnsOnSemiOpen(chess),
            pawnMajority: this.evaluatePawnMajority(chess),
            doubledPawns: this.evaluateDoubledPawns(chess),
            pawnIslands: this.evaluatePawnIslands(chess),
            hangingPawns: this.evaluateHangingPawns(chess),
            pawnChains: this.evaluatePawnChains(chess)
        };
    }

    /**
     * Évalue les pions de protection du roi (0.0 à 1.0)
     */
    private evaluateKingPawnShield(chess: Chess): number {
        const kingSquare = this.findKingSquare(chess, 'w');
        if (!kingSquare) return 0.0;

        let score = 0.0;
        const kingFile = kingSquare.charCodeAt(0) - 'a'.charCodeAt(0);
        const kingRank = parseInt(kingSquare[1]);

        // Bonus si roi roqué
        if (this.isKingCastled(kingSquare)) {
            score += 0.3;

            // Vérifier les pions protecteurs selon le côté du roque
            if (kingFile >= 6) { // Roque côté roi (colonnes g-h)
                score += this.checkPawnShield(chess, ['f2', 'g2', 'h2']);
            } else if (kingFile <= 2) { // Roque côté dame (colonnes a-c)
                score += this.checkPawnShield(chess, ['a2', 'b2', 'c2']);
            }
        } else {
            // Roi au centre - pénalité
            if (kingFile >= 3 && kingFile <= 4 && kingRank === 1) {
                score = 0.1; // Très faible protection
            }
        }

        return Math.min(score, 1.0);
    }

    private checkPawnShield(chess: Chess, squares: string[]): number {
        let shieldScore = 0.0;

        squares.forEach(square => {
            const piece = chess.get(square as Square);
            if (piece && piece.type === 'p' && piece.color === 'w') {
                shieldScore += 0.2; // Pion intact
            } else {
                // Vérifier si pion avancé d'une case
                const advancedSquare = square[0] + '3';
                const advancedPiece = chess.get(advancedSquare as Square);
                if (advancedPiece && advancedPiece.type === 'p' && advancedPiece.color === 'w') {
                    shieldScore += 0.1; // Pion avancé mais encore protecteur
                }
            }
        });

        return shieldScore;
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

    private isKingCastled(kingSquare: string): boolean {
        // Roi considéré comme roqué s'il est en g1, c1 (ou positions similaires)
        return kingSquare === 'g1' || kingSquare === 'c1';
    }

    // Méthodes d'évaluation pour les autres indicateurs (à implémenter)
    private evaluateKingExposedInCenter(chess: Chess): number { return 0.5; }
    private evaluateOpenLinesAgainstKing(chess: Chess): number { return 0.5; }
    private evaluateKingCastlingSafety(chess: Chess): number { return 0.5; }
    private evaluateKingEscapeSquares(chess: Chess): number { return 0.5; }
    private evaluateAttackersVsDefenders(chess: Chess): number { return 0.5; }

    private evaluateMaterialAdvantage(chess: Chess): number { return 0.5; }
    private evaluateBishopPair(chess: Chess): number { return 0.5; }
    private evaluateLightSquareAdvantage(chess: Chess): number { return 0.5; }
    private evaluateDarkSquareAdvantage(chess: Chess): number { return 0.5; }
    private evaluateQueenVsMinorPieces(chess: Chess): number { return 0.5; }
    private evaluateRookVsMinorPieces(chess: Chess): number { return 0.5; }
    private evaluateExchangeQuality(chess: Chess): number { return 0.5; }

    private evaluateActivePieces(chess: Chess): number { return 0.5; }
    private evaluatePieceMobility(chess: Chess): number { return 0.5; }
    private evaluatePieceCoordination(chess: Chess): number { return 0.5; }
    private evaluateRookColumnControl(chess: Chess): number { return 0.5; }
    private evaluateOverloadedPieces(chess: Chess): number { return 0.5; }
    private evaluateBadlyPlacedPieces(chess: Chess): number { return 0.5; }
    private evaluateBishopVsKnight(chess: Chess): number { return 0.5; }

    private evaluateCenterControl(chess: Chess): number { return 0.5; }
    private evaluateSpaceAdvantage(chess: Chess): number { return 0.5; }
    private evaluateWeakSquares(chess: Chess): number { return 0.5; }
    private evaluateOutposts(chess: Chess): number { return 0.5; }
    private evaluateHoles(chess: Chess): number { return 0.5; }
    private evaluateCenterTension(chess: Chess): number { return 0.5; }

    private evaluatePassedPawns(chess: Chess): number { return 0.5; }
    private evaluateProtectedPassedPawns(chess: Chess): number { return 0.5; }
    private evaluateDistantPassedPawns(chess: Chess): number { return 0.5; }
    private evaluateIsolatedPawns(chess: Chess): number { return 0.5; }
    private evaluateBackwardPawns(chess: Chess): number { return 0.5; }
    private evaluateBackwardPawnsOnSemiOpen(chess: Chess): number { return 0.5; }
    private evaluatePawnMajority(chess: Chess): number { return 0.5; }
    private evaluateDoubledPawns(chess: Chess): number { return 0.5; }
    private evaluatePawnIslands(chess: Chess): number { return 0.5; }
    private evaluateHangingPawns(chess: Chess): number { return 0.5; }
    private evaluatePawnChains(chess: Chess): number { return 0.5; }
} 