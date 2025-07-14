import { Injectable, inject } from '@angular/core';
import { PositionEvaluatorService, PositionEvaluation } from './position-evaluator.service';
import { PositionAdviceService } from './position-advice.service';

export interface MoveAnalysis {
    moveNumber: number;
    fen: string;
    san: string;
    evaluation: PositionEvaluation;
    dominantFactor: string;
    advantageColor: 'white' | 'black' | 'neutral';
    advantageStrength: number;
    advice: string;
    diagnosis: string;
    prescription: string;
}

export interface StrategicPeriod {
    startMove: number;
    endMove: number;
    dominantFactor: string;
    advantageColor: 'white' | 'black' | 'neutral';
    averageStrength: number;
    description: string;
    keyMoves: number[]; // Coups importants dans cette période
    evaluation: PositionEvaluation; // Évaluation moyenne de la période
}

export interface CriticalMoment {
    moveNumber: number;
    type: 'transition' | 'critical_decision' | 'blunder' | 'brilliant' | 'turning_point';
    description: string;
    significance: number; // 1-5
    beforeEval: PositionEvaluation;
    afterEval: PositionEvaluation;
}

export interface GameAnalysisResult {
    moves: MoveAnalysis[];
    periods: StrategicPeriod[];
    criticalMoments: CriticalMoment[];
    gamePhases: {
        opening: { start: number; end: number };
        middlegame: { start: number; end: number };
        endgame: { start: number; end: number };
    };
    summary: {
        whiteAdvantages: string[];
        blackAdvantages: string[];
        keyTurningPoints: number[];
        gameCharacter: 'tactical' | 'positional' | 'mixed';
    };
}

@Injectable({
    providedIn: 'root'
})
export class GameAnalysisService {
    private positionEvaluator = inject(PositionEvaluatorService);
    private positionAdvice = inject(PositionAdviceService);

    /**
     * Analyse complète d'une partie à partir de l'historique des positions
     */
    analyzeCompleteGame(positions: string[], moves: string[] = []): GameAnalysisResult {
        console.log('🔍 Analyse complète de la partie - Positions:', positions.length);

        // 1. Analyser chaque position individuellement
        const moveAnalyses = this.analyzeMoves(positions, moves);

        // 2. Détecter les périodes stratégiques
        const periods = this.detectStrategicPeriods(moveAnalyses);

        // 3. Identifier les moments critiques
        const criticalMoments = this.detectCriticalMoments(moveAnalyses);

        // 4. Déterminer les phases de jeu
        const gamePhases = this.identifyGamePhases(moveAnalyses);

        // 5. Générer le résumé
        const summary = this.generateGameSummary(moveAnalyses, periods, criticalMoments);

        return {
            moves: moveAnalyses,
            periods,
            criticalMoments,
            gamePhases,
            summary
        };
    }

    private analyzeMoves(positions: string[], moves: string[]): MoveAnalysis[] {
        return positions.map((fen, index) => {
            const evaluation = this.positionEvaluator.evaluatePosition(fen);
            const dominantFactor = this.getDominantFactor(evaluation);
            const advantageColor = this.getAdvantageColor(evaluation);
            const advantageStrength = this.getAdvantageStrength(evaluation);

            const adviceResult = this.positionAdvice.getPositionAdviceWithDebug(evaluation, fen);

            return {
                moveNumber: index,
                fen,
                san: moves[index] || '',
                evaluation,
                dominantFactor,
                advantageColor,
                advantageStrength,
                advice: adviceResult.diagnosis + (adviceResult.prescription ? ' : ' + adviceResult.prescription : ''),
                diagnosis: adviceResult.diagnosis,
                prescription: adviceResult.prescription
            };
        });
    }

    private detectStrategicPeriods(moves: MoveAnalysis[]): StrategicPeriod[] {
        const periods: StrategicPeriod[] = [];
        let currentPeriod: Partial<StrategicPeriod> | null = null;

        const SIMILARITY_THRESHOLD = 20; // Seuil pour grouper les coups similaires
        const MIN_PERIOD_LENGTH = 3; // Minimum 3 coups pour former une période

        moves.forEach((move, index) => {
            const shouldStartNewPeriod = !currentPeriod ||
                currentPeriod.dominantFactor !== move.dominantFactor ||
                currentPeriod.advantageColor !== move.advantageColor ||
                Math.abs((currentPeriod.averageStrength || 0) - move.advantageStrength) > SIMILARITY_THRESHOLD;

            if (shouldStartNewPeriod) {
                // Finaliser la période précédente si elle est assez longue
                if (currentPeriod && ((currentPeriod as StrategicPeriod).endMove - (currentPeriod as StrategicPeriod).startMove + 1) >= MIN_PERIOD_LENGTH) {
                    periods.push(this.finalizePeriod(currentPeriod as StrategicPeriod, moves));
                }

                // Commencer une nouvelle période
                currentPeriod = {
                    startMove: index,
                    endMove: index,
                    dominantFactor: move.dominantFactor,
                    advantageColor: move.advantageColor,
                    averageStrength: move.advantageStrength,
                    keyMoves: [index]
                };
            } else {
                // Étendre la période courante
                currentPeriod!.endMove = index;
                currentPeriod!.averageStrength = (currentPeriod!.averageStrength! + move.advantageStrength) / 2;

                // Ajouter comme coup clé si significatif
                if (move.advantageStrength > 40) {
                    currentPeriod!.keyMoves!.push(index);
                }
            }
        });

        // Finaliser la dernière période
        if (currentPeriod && ((currentPeriod as StrategicPeriod).endMove - (currentPeriod as StrategicPeriod).startMove + 1) >= MIN_PERIOD_LENGTH) {
            periods.push(this.finalizePeriod(currentPeriod as StrategicPeriod, moves));
        }

        return periods;
    }

    private finalizePeriod(period: StrategicPeriod, moves: MoveAnalysis[]): StrategicPeriod {
        // Calculer l'évaluation moyenne de la période
        const periodMoves = moves.slice(period.startMove, period.endMove + 1);
        const avgEvaluation = this.calculateAverageEvaluation(periodMoves.map(m => m.evaluation));

        // Générer une description intelligente
        const description = this.generatePeriodDescription(period, periodMoves);

        return {
            ...period,
            evaluation: avgEvaluation,
            description
        };
    }

    private detectCriticalMoments(moves: MoveAnalysis[]): CriticalMoment[] {
        const moments: CriticalMoment[] = [];
        const SIGNIFICANT_CHANGE = 30; // Changement significatif dans l'évaluation

        for (let i = 1; i < moves.length; i++) {
            const prev = moves[i - 1];
            const curr = moves[i];

            // Calculer le changement d'évaluation globale
            const prevTotal = this.getTotalAdvantage(prev.evaluation);
            const currTotal = this.getTotalAdvantage(curr.evaluation);
            const change = Math.abs(currTotal - prevTotal);

            if (change > SIGNIFICANT_CHANGE) {
                const type = this.determineMomentType(prev, curr, change);
                const significance = Math.min(5, Math.floor(change / 20) + 1);

                moments.push({
                    moveNumber: i,
                    type,
                    description: this.generateMomentDescription(type, prev, curr),
                    significance,
                    beforeEval: prev.evaluation,
                    afterEval: curr.evaluation
                });
            }
        }

        return moments;
    }

    private identifyGamePhases(moves: MoveAnalysis[]): GameAnalysisResult['gamePhases'] {
        const totalMoves = moves.length;

        // Heuristiques simples pour détecter les phases
        const opening = { start: 0, end: Math.min(15, Math.floor(totalMoves * 0.3)) };
        const endgameStart = this.detectEndgameStart(moves);
        const middlegame = { start: opening.end, end: endgameStart };
        const endgame = { start: endgameStart, end: totalMoves - 1 };

        return { opening, middlegame, endgame };
    }

    private generateGameSummary(
        moves: MoveAnalysis[],
        periods: StrategicPeriod[],
        moments: CriticalMoment[]
    ): GameAnalysisResult['summary'] {

        const whiteAdvantages: string[] = [];
        const blackAdvantages: string[] = [];

        // Analyser les avantages dominants
        periods.forEach(period => {
            if (period.advantageColor === 'white' && period.averageStrength > 25) {
                whiteAdvantages.push(this.getFactorDisplayName(period.dominantFactor));
            } else if (period.advantageColor === 'black' && period.averageStrength > 25) {
                blackAdvantages.push(this.getFactorDisplayName(period.dominantFactor));
            }
        });

        const keyTurningPoints = moments
            .filter(m => m.significance >= 4)
            .map(m => m.moveNumber);

        const tacticalMoments = moments.filter(m => m.type === 'blunder' || m.type === 'brilliant').length;
        const gameCharacter: 'tactical' | 'positional' | 'mixed' =
            tacticalMoments > periods.length ? 'tactical' :
                tacticalMoments === 0 ? 'positional' : 'mixed';

        return {
            whiteAdvantages: [...new Set(whiteAdvantages)],
            blackAdvantages: [...new Set(blackAdvantages)],
            keyTurningPoints,
            gameCharacter
        };
    }

    // Méthodes utilitaires
    private getDominantFactor(evaluation: PositionEvaluation): string {
        const factors = [
            { name: 'materialBalance', value: Math.abs(evaluation.materialBalance.percentage) },
            { name: 'spaceControl', value: Math.abs(evaluation.spaceControl.percentage) },
            { name: 'pieceActivity', value: Math.abs(evaluation.pieceActivity.percentage) },
            { name: 'kingSafety', value: Math.abs(evaluation.kingSafety.percentage) },
            { name: 'pawnStructure', value: Math.abs(evaluation.pawnStructure.percentage) }
        ];

        factors.sort((a, b) => b.value - a.value);
        return factors[0].value > 20 ? factors[0].name : 'balanced';
    }

    private getAdvantageColor(evaluation: PositionEvaluation): 'white' | 'black' | 'neutral' {
        const total = evaluation.materialBalance.percentage +
            evaluation.spaceControl.percentage +
            evaluation.pieceActivity.percentage +
            evaluation.kingSafety.percentage +
            evaluation.pawnStructure.percentage;

        if (total > 15) return 'white';
        if (total < -15) return 'black';
        return 'neutral';
    }

    private getAdvantageStrength(evaluation: PositionEvaluation): number {
        const total = Math.abs(
            evaluation.materialBalance.percentage +
            evaluation.spaceControl.percentage +
            evaluation.pieceActivity.percentage +
            evaluation.kingSafety.percentage +
            evaluation.pawnStructure.percentage
        );

        return Math.min(100, total / 5);
    }

    private getTotalAdvantage(evaluation: PositionEvaluation): number {
        return evaluation.materialBalance.percentage +
            evaluation.spaceControl.percentage +
            evaluation.pieceActivity.percentage +
            evaluation.kingSafety.percentage +
            evaluation.pawnStructure.percentage;
    }

    private calculateAverageEvaluation(evaluations: PositionEvaluation[]): PositionEvaluation {
        const avgMaterial = evaluations.reduce((sum, e) => sum + e.materialBalance.percentage, 0) / evaluations.length;
        const avgSpace = evaluations.reduce((sum, e) => sum + e.spaceControl.percentage, 0) / evaluations.length;
        const avgActivity = evaluations.reduce((sum, e) => sum + e.pieceActivity.percentage, 0) / evaluations.length;
        const avgSafety = evaluations.reduce((sum, e) => sum + e.kingSafety.percentage, 0) / evaluations.length;
        const avgStructure = evaluations.reduce((sum, e) => sum + e.pawnStructure.percentage, 0) / evaluations.length;

        return {
            materialBalance: { raw: { white: 0, black: 0 }, percentage: avgMaterial },
            spaceControl: { raw: { white: 0, black: 0 }, percentage: avgSpace },
            pieceActivity: { raw: { white: 0, black: 0 }, percentage: avgActivity },
            kingSafety: { raw: { white: 0, black: 0 }, percentage: avgSafety },
            pawnStructure: { raw: { white: 0, black: 0 }, percentage: avgStructure }
        };
    }

    private generatePeriodDescription(period: StrategicPeriod, moves: MoveAnalysis[]): string {
        const factorNames: { [key: string]: string } = {
            'materialBalance': 'avantage matériel',
            'spaceControl': 'contrôle de l\'espace',
            'pieceActivity': 'activité des pièces',
            'kingSafety': 'sécurité du roi',
            'pawnStructure': 'structure de pions',
            'balanced': 'jeu équilibré'
        };

        const colorNames = {
            'white': 'Les blancs',
            'black': 'Les noirs',
            'neutral': 'Jeu'
        };

        if (period.dominantFactor === 'balanced') {
            return 'Position équilibrée avec jeu complexe';
        }

        const intensity = period.averageStrength > 60 ? 'dominent avec leur' :
            period.averageStrength > 30 ? 'exploitent leur' : 'travaillent sur leur';

        return `${colorNames[period.advantageColor]} ${intensity} ${factorNames[period.dominantFactor]}`;
    }

    private determineMomentType(prev: MoveAnalysis, curr: MoveAnalysis, change: number): CriticalMoment['type'] {
        if (change > 60) return 'turning_point';
        if (change > 45) return 'critical_decision';
        if (prev.advantageColor !== curr.advantageColor) return 'transition';
        if (change > 35 && curr.advantageStrength < prev.advantageStrength) return 'blunder';
        if (change > 35 && curr.advantageStrength > prev.advantageStrength) return 'brilliant';
        return 'critical_decision';
    }

    private generateMomentDescription(type: CriticalMoment['type'], prev: MoveAnalysis, curr: MoveAnalysis): string {
        switch (type) {
            case 'turning_point': return 'Point de bascule majeur dans la partie';
            case 'transition': return 'L\'initiative change de camp';
            case 'critical_decision': return 'Moment critique nécessitant précision';
            case 'blunder': return 'Erreur stratégique importante';
            case 'brilliant': return 'Coup stratégiquement excellent';
            default: return 'Moment significatif';
        }
    }

    private detectEndgameStart(moves: MoveAnalysis[]): number {
        // Détecter le début de la finale par la diminution de matériel
        for (let i = Math.floor(moves.length * 0.6); i < moves.length; i++) {
            const material = Math.abs(moves[i].evaluation.materialBalance.raw.white + moves[i].evaluation.materialBalance.raw.black);
            if (material <= 20) { // Approximation : finale quand il reste peu de matériel
                return i;
            }
        }
        return Math.floor(moves.length * 0.8); // Défaut : 80% de la partie
    }

    private getFactorDisplayName(factor: string): string {
        const names: { [key: string]: string } = {
            'materialBalance': 'Avantage matériel',
            'spaceControl': 'Contrôle de l\'espace',
            'pieceActivity': 'Activité des pièces',
            'kingSafety': 'Sécurité du roi',
            'pawnStructure': 'Structure de pions'
        };
        return names[factor] || factor;
    }
} 