import { Injectable, inject, signal } from '@angular/core';
import { PositionEvaluatorService, PositionEvaluation } from './position-evaluator.service';
import { PositionAdviceService } from './position-advice.service';
import { GameAnalysisService, GameAnalysisResult } from './game-analysis.service';
import { getDirectionIcon } from '../data/position-comments-base';

export interface CachedMoveAnalysis {
    moveNumber: number;
    fen: string;
    san: string;
    evaluation: PositionEvaluation;
    dominantFactor: string;
    advantageColor: 'white' | 'black' | 'neutral';
    advantageStrength: number;

    // Conseils détaillés par couleur
    whiteAdvice: string;
    blackAdvice: string;
    whiteAdviceIcon: string;
    blackAdviceIcon: string;
    whiteDirection: string;
    blackDirection: string;
    whiteAdvantages: string;
    blackAdvantages: string;

    // Analyse complète
    advice: string;
    diagnosis: string;
    prescription: string;

    // Métadonnées
    gamePhase: 'opening' | 'middlegame' | 'endgame';
    isKeyMove: boolean;
    isCriticalMoment: boolean;
}

export interface GameCache {
    gameId: string;
    pgn: string;
    totalMoves: number;
    moves: CachedMoveAnalysis[];
    completeAnalysis: GameAnalysisResult;
    createdAt: Date;
    analysisTime: number; // Temps de calcul en ms
}

@Injectable({
    providedIn: 'root'
})
export class GameAnalysisCacheService {
    private positionEvaluator = inject(PositionEvaluatorService);
    private positionAdvice = inject(PositionAdviceService);
    private gameAnalysis = inject(GameAnalysisService);

    // Cache principal
    private gamesCacheMap = new Map<string, GameCache>();
    private currentGameCache = signal<GameCache | null>(null);

    // État du processus de cache
    private isAnalyzing = signal(false);
    private analysisProgress = signal(0);

    constructor() {
        console.log('🗄️ Service GameAnalysisCache initialisé');
    }

    /**
     * Pré-analyse complète d'un PGN et stockage en cache
     */
    async analyzeAndCacheGame(pgn: string, positions: string[], moves: string[]): Promise<GameCache> {
        const startTime = Date.now();
        const gameId = this.generateGameId(pgn);

        console.log('🔄 Début de l\'analyse complète du PGN:', gameId);
        this.isAnalyzing.set(true);
        this.analysisProgress.set(0);

        try {
            // 1. Analyse complète de la partie
            const completeAnalysis = this.gameAnalysis.analyzeCompleteGame(positions, moves);

            // 2. Analyse détaillée de chaque position
            const cachedMoves: CachedMoveAnalysis[] = [];

            for (let i = 0; i < positions.length; i++) {
                const fen = positions[i];
                const san = moves[i] || '';

                // Évaluation de la position
                const evaluation = this.positionEvaluator.evaluatePosition(fen);

                // Conseils détaillés avec FEN
                const adviceResult = this.positionAdvice.getPositionAdviceWithDebug(evaluation, fen);

                let whiteFullAdvice: string;
                let blackFullAdvice: string;
                let whiteAdviceIcon: string;
                let blackAdviceIcon: string;
                let whiteDirection: string;
                let blackDirection: string;
                let whiteAdvantages: string;
                let blackAdvantages: string;

                // KISS : Si position initiale, même conseil pour les deux couleurs
                if (adviceResult.situationKey === 'initial_position') {
                    const initAdvice = `${adviceResult.diagnosis} : ${adviceResult.prescription}`;
                    whiteFullAdvice = initAdvice;
                    blackFullAdvice = initAdvice;
                    whiteAdviceIcon = adviceResult.icon;
                    blackAdviceIcon = adviceResult.icon;
                    whiteDirection = 'init';
                    blackDirection = 'init';
                    whiteAdvantages = '';
                    blackAdvantages = '';
                } else {
                    // Position normale : conseils par couleur
                    const whiteAdvantagesList = adviceResult.whiteAdvantages.map(adv => this.getDisplayName(adv));
                    const blackAdvantagesList = adviceResult.blackAdvantages.map(adv => this.getDisplayName(adv));

                    // Générer les conseils spécifiques pour chaque couleur
                    const whiteKey = this.getAdviceKeyForColor('white', adviceResult.whiteAdvantages, adviceResult.blackAdvantages);
                    const blackKey = this.getAdviceKeyForColor('black', adviceResult.whiteAdvantages, adviceResult.blackAdvantages);

                    const whiteAdviceDetail = this.positionAdvice.getAdviceByKey(whiteKey);
                    const blackAdviceDetail = this.positionAdvice.getAdviceByKey(blackKey);

                    whiteFullAdvice = this.formatAdvice(whiteAdviceDetail);
                    blackFullAdvice = this.formatAdvice(blackAdviceDetail);
                    whiteAdviceIcon = whiteAdviceDetail?.direction ? getDirectionIcon(whiteAdviceDetail.direction) : '';
                    blackAdviceIcon = blackAdviceDetail?.direction ? getDirectionIcon(blackAdviceDetail.direction) : '';
                    whiteDirection = whiteAdviceDetail?.direction || '';
                    blackDirection = blackAdviceDetail?.direction || '';
                    whiteAdvantages = whiteAdvantagesList.join(', ');
                    blackAdvantages = blackAdvantagesList.join(', ');
                }

                // Déterminer la phase de jeu
                const gamePhase = this.determineGamePhase(i, completeAnalysis.gamePhases);

                // Vérifier si c'est un coup clé ou critique
                const isKeyMove = completeAnalysis.periods.some(p => p.keyMoves.includes(i));
                const isCriticalMoment = completeAnalysis.criticalMoments.some(m => m.moveNumber === i);

                cachedMoves.push({
                    moveNumber: i,
                    fen,
                    san,
                    evaluation,
                    dominantFactor: this.getDominantFactor(evaluation),
                    advantageColor: this.getAdvantageColor(evaluation),
                    advantageStrength: this.getAdvantageStrength(evaluation),

                    whiteAdvice: whiteFullAdvice,
                    blackAdvice: blackFullAdvice,
                    whiteAdviceIcon: whiteAdviceIcon,
                    blackAdviceIcon: blackAdviceIcon,
                    whiteDirection: whiteDirection,
                    blackDirection: blackDirection,
                    whiteAdvantages: whiteAdvantages,
                    blackAdvantages: blackAdvantages,

                    advice: adviceResult.diagnosis + (adviceResult.prescription ? ' : ' + adviceResult.prescription : ''),
                    diagnosis: adviceResult.diagnosis,
                    prescription: adviceResult.prescription,

                    gamePhase,
                    isKeyMove,
                    isCriticalMoment
                });

                // Mettre à jour le progrès
                this.analysisProgress.set(Math.round((i + 1) / positions.length * 100));

                // Petite pause pour ne pas bloquer l'UI
                if (i % 10 === 0) {
                    await new Promise(resolve => setTimeout(resolve, 1));
                }
            }

            const analysisTime = Date.now() - startTime;

            // Créer le cache complet
            const gameCache: GameCache = {
                gameId,
                pgn,
                totalMoves: positions.length,
                moves: cachedMoves,
                completeAnalysis,
                createdAt: new Date(),
                analysisTime
            };

            // Stocker en cache
            this.gamesCacheMap.set(gameId, gameCache);
            this.currentGameCache.set(gameCache);

            console.log(`✅ Analyse terminée en ${analysisTime}ms - ${positions.length} positions analysées`);
            console.log('📊 Cache créé:', {
                moves: cachedMoves.length,
                periods: completeAnalysis.periods.length,
                criticalMoments: completeAnalysis.criticalMoments.length
            });

            return gameCache;

        } finally {
            this.isAnalyzing.set(false);
            this.analysisProgress.set(100);
        }
    }

    /**
     * Récupère l'analyse d'une position depuis le cache
     */
    getMoveAnalysis(moveIndex: number): CachedMoveAnalysis | null {
        const cache = this.currentGameCache();
        if (!cache || moveIndex < 0 || moveIndex >= cache.moves.length) {
            return null;
        }
        return cache.moves[moveIndex];
    }

    /**
     * Récupère l'analyse complète de la partie courante
     */
    getCompleteAnalysis(): GameAnalysisResult | null {
        const cache = this.currentGameCache();
        return cache ? cache.completeAnalysis : null;
    }

    /**
     * Vide le cache actuel
     */
    clearCurrentCache(): void {
        this.currentGameCache.set(null);
        console.log('🗑️ Cache actuel vidé');
    }

    /**
     * Vide tout le cache
     */
    clearAllCache(): void {
        this.gamesCacheMap.clear();
        this.currentGameCache.set(null);
        console.log('🗑️ Tout le cache vidé');
    }

    /**
     * Getters pour l'état du processus
     */
    isAnalyzing$ = this.isAnalyzing.asReadonly();
    analysisProgress$ = this.analysisProgress.asReadonly();
    currentGameCache$ = this.currentGameCache.asReadonly();

    // Méthodes utilitaires privées

    private generateGameId(pgn: string): string {
        // Simple hash du PGN pour identifier la partie
        let hash = 0;
        for (let i = 0; i < pgn.length; i++) {
            const char = pgn.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convertir en 32bit
        }
        return 'game_' + Math.abs(hash).toString(16) + '_' + Date.now();
    }

    private getDisplayName(advantage: string): string {
        const displayNames: { [key: string]: string } = {
            'kingSafety': "Sécurité du roi",
            'materialBalance': "Avantage matériel",
            'pieceActivity': "Activité des pièces",
            'spaceControl': "Contrôle de l'espace",
            'pawnStructure': "Structure de pions"
        };
        return displayNames[advantage] || advantage;
    }

    private getKeyFromDisplayName(displayName: string): string {
        const keyMap: { [key: string]: string } = {
            "Sécurité du roi": 'kingSafety',
            "Avantage matériel": 'materialBalance',
            "Activité des pièces": 'pieceActivity',
            "Contrôle de l'espace": 'spaceControl',
            "Structure de pions": 'pawnStructure'
        };
        return keyMap[displayName] || '';
    }

    private getAdviceKeyForColor(color: 'white' | 'black', whiteAdvantages: string[], blackAdvantages: string[]): string {
        const evaluationOrder = [
            'materialBalance',
            'spaceControl',
            'pieceActivity',
            'kingSafety',
            'pawnStructure'
        ];

        const whiteKeysOrdered = evaluationOrder.filter(key => whiteAdvantages.includes(key));
        const blackKeysOrdered = evaluationOrder.filter(key => blackAdvantages.includes(key));

        const avantages = [whiteKeysOrdered, blackKeysOrdered];

        if (color === 'black') {
            avantages.reverse();
        }

        return `${avantages[0].join('_')}_vs_${avantages[1].join('_')}`;
    }

    private formatAdvice(advice: any): string {
        if (!advice) return '';

        if (advice.diagnosis && advice.prescription) {
            return `${advice.diagnosis} : ${advice.prescription}`;
        }

        return advice.diagnosis || advice.prescription || '';
    }

    private determineGamePhase(moveIndex: number, gamePhases: GameAnalysisResult['gamePhases']): 'opening' | 'middlegame' | 'endgame' {
        if (moveIndex >= gamePhases.opening.start && moveIndex <= gamePhases.opening.end) {
            return 'opening';
        } else if (moveIndex >= gamePhases.middlegame.start && moveIndex <= gamePhases.middlegame.end) {
            return 'middlegame';
        } else {
            return 'endgame';
        }
    }

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
} 