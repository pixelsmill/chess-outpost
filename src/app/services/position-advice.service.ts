import { Injectable } from '@angular/core';
import { PositionEvaluation } from './position-evaluator.service';
import { PositionAdvice, POSITION_COMMENTS } from '../data/position-comments';
import { getDirectionIcon } from '../data/position-comments-base';

export interface PositionAdvantage {
    type: string;
    percentage: number;
    forWhite: boolean;
}

export interface AdviceResult {
    diagnosis: string;
    prescription: string;
    icon: string;
    debugInfo: string;
    situationKey: string;
    whiteAdvantages: string[];
    blackAdvantages: string[];
}

@Injectable({
    providedIn: 'root'
})
export class PositionAdviceService {
    private readonly adviceData = POSITION_COMMENTS;

    // KISS : Une seule constante, un seul endroit
    private readonly INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

    // Seuils de significativité spécifiques pour chaque type d'avantage
    private readonly SIGNIFICANCE_THRESHOLDS = {
        materialBalance: 5,    // 5% minimum - très sensible pour 1 point d'écart
        spaceControl: 15,      // 15% minimum 
        pieceActivity: 15,     // 15% minimum
        kingSafety: 15,        // 15% minimum
        pawnStructure: 15      // 15% minimum
    };

    // Ordre fixe des facteurs d'évaluation - IMPORTANT: cet ordre doit correspondre à l'ordre utilisé dans le JSON
    private readonly EVALUATION_ORDER = [
        'materialBalance',
        'spaceControl',
        'pieceActivity',
        'kingSafety',
        'pawnStructure'
    ];

    // Noms d'affichage pour les facteurs
    private readonly DISPLAY_NAMES: { [key: string]: string } = {
        'kingSafety': "Sécurité du roi",
        'materialBalance': "Avantage matériel",
        'pieceActivity': "Activité des pièces",
        'spaceControl': "Contrôle de l'espace",
        'pawnStructure': "Structure de pions"
    };

    constructor() {
    }

    getPositionAdvantages(evaluation: PositionEvaluation): PositionAdvantage[] {
        const advantages: PositionAdvantage[] = [];

        // Parcours des évaluations dans l'ordre fixe
        for (const key of this.EVALUATION_ORDER) {
            const value = evaluation[key as keyof PositionEvaluation];
            const deviation = Math.abs(value.percentage);
            const threshold = this.SIGNIFICANCE_THRESHOLDS[key as keyof typeof this.SIGNIFICANCE_THRESHOLDS];

            if (deviation >= threshold) {
                const forWhite = value.percentage > 0;
                advantages.push({
                    type: this.DISPLAY_NAMES[key] || key,
                    percentage: value.percentage,
                    forWhite: forWhite
                });
            }
        }

        // Tri par pourcentage d'avantage (du plus grand au plus petit)
        return advantages.sort((a, b) =>
            Math.abs(50 - b.percentage) - Math.abs(50 - a.percentage)
        ).slice(0, 5); // Limite à 5 avantages maximum
    }

    // Méthodes de compatibilité pour l'ancienne API
    getPositionAdvice(evaluation: PositionEvaluation): string {
        const result = this.getPositionAdviceWithDebug(evaluation);
        // Combiner diagnosis et prescription avec " : " pour maintenir la compatibilité
        if (result.diagnosis && result.prescription) {
            return `${result.diagnosis} : ${result.prescription}`;
        }
        return result.diagnosis || result.prescription || "";
    }

    getDiagnosis(evaluation: PositionEvaluation): string {
        return this.getPositionAdviceWithDebug(evaluation).diagnosis;
    }

    getPrescription(evaluation: PositionEvaluation): string {
        return this.getPositionAdviceWithDebug(evaluation).prescription;
    }

    getPositionAdviceWithDebug(evaluation: PositionEvaluation, fen?: string): AdviceResult {

        // KISS : Détecter position initiale par FEN
        if (fen === this.INITIAL_FEN) {
            const initAdvice = this.adviceData.situations["initial_position"];
            if (initAdvice) {
                return {
                    diagnosis: initAdvice.diagnosis,
                    prescription: initAdvice.prescription,
                    icon: getDirectionIcon(initAdvice.direction),
                    debugInfo: "Position initiale détectée",
                    situationKey: "initial_position",
                    whiteAdvantages: [],
                    blackAdvantages: []
                };
            }
        }

        // Identifier les avantages significatifs en utilisant l'ordre fixe
        const whiteAdvantages: string[] = [];
        const blackAdvantages: string[] = [];

        for (const key of this.EVALUATION_ORDER) {
            const value = evaluation[key as keyof PositionEvaluation];
            const deviation = Math.abs(value.percentage);
            const threshold = this.SIGNIFICANCE_THRESHOLDS[key as keyof typeof this.SIGNIFICANCE_THRESHOLDS];
            if (deviation >= threshold) {
                if (value.percentage > 0) {
                    whiteAdvantages.push(key);
                } else {
                    blackAdvantages.push(key);
                }
            }
        }

        // Si aucun avantage significatif détecté
        if (whiteAdvantages.length === 0 && blackAdvantages.length === 0) {
            return {
                diagnosis: "",
                prescription: "",
                icon: "⚖️",
                debugInfo: "Aucun avantage significatif détecté",
                situationKey: "",
                whiteAdvantages: [],
                blackAdvantages: []
            };
        }

        // Déterminer quelle couleur a le plus d'avantages significatifs pour donner le conseil
        let advantageColor: string;
        let myAdvantages: string[];
        let opponentAdvantages: string[];

        if (whiteAdvantages.length >= blackAdvantages.length) {
            advantageColor = 'Blancs';
            myAdvantages = whiteAdvantages;
            opponentAdvantages = blackAdvantages;
        } else {
            advantageColor = 'Noirs';
            myAdvantages = blackAdvantages;
            opponentAdvantages = whiteAdvantages;
        }

        // Construire la clé situationnelle
        const situationKey = this.buildSituationKey(myAdvantages, opponentAdvantages);

        // Chercher le conseil dans les situations
        const adviceData: PositionAdvice | undefined = this.adviceData.situations[situationKey];

        if (!adviceData) {
            return {
                diagnosis: "",
                prescription: "",
                icon: "❓",
                debugInfo: `Situation non trouvée: ${situationKey}`,
                situationKey: situationKey,
                whiteAdvantages: whiteAdvantages,
                blackAdvantages: blackAdvantages
            };
        }

        return {
            diagnosis: adviceData.diagnosis,
            prescription: adviceData.prescription,
            icon: getDirectionIcon(adviceData.direction),
            debugInfo: myAdvantages.join(', '),
            situationKey: situationKey,
            whiteAdvantages: whiteAdvantages,
            blackAdvantages: blackAdvantages
        };
    }

    /**
     * Construit une clé situationnelle au format "mesAvantages_vs_leursAvantages"
     * IMPORTANT: Respecte l'ordre fixe des facteurs
     */
    private buildSituationKey(myAdvantages: string[], opponentAdvantages: string[]): string {
        // Construire mes avantages dans l'ordre correct
        const myAdvantagesOrdered = this.buildKeyInCorrectOrder(myAdvantages);

        // Si l'adversaire n'a pas d'avantages, retourner seulement mes avantages
        if (opponentAdvantages.length === 0) {
            return myAdvantagesOrdered;
        }

        // Construire leurs avantages dans l'ordre correct
        const opponentAdvantagesOrdered = this.buildKeyInCorrectOrder(opponentAdvantages);

        // Retourner la clé situationnelle complète
        return `${myAdvantagesOrdered}_vs_${opponentAdvantagesOrdered}`;
    }

    /**
     * Construit une clé en respectant l'ordre fixe des facteurs
     * IMPORTANT: Cet ordre doit correspondre à l'ordre utilisé dans le fichier JSON
     */
    private buildKeyInCorrectOrder(factors: string[]): string {
        // Filtrer les facteurs pour ne garder que ceux qui sont dans l'ordre d'évaluation
        const orderedFactors = this.EVALUATION_ORDER.filter(factor => factors.includes(factor));

        // Joindre les facteurs avec un underscore
        return orderedFactors.join('_');
    }

    /**
     * Récupère un conseil directement par clé situationnelle
     * @param situationKey La clé situationnelle (ex: "spaceControl_pieceActivity_vs_kingSafety")
     * @returns Le conseil correspondant ou null si non trouvé
     */
    getAdviceByKey(situationKey: string): PositionAdvice | null {
        if (!situationKey || situationKey.trim() === '') {
            return null;
        }

        const advice = this.adviceData.situations[situationKey];
        if (advice) {
            return advice;
        }

        return null;
    }
} 