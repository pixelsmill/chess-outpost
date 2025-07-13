export interface PositionAdvice {
    diagnosis: string;    // Description de la situation stratégique
    prescription: string; // Action recommandée
    icon: string;         // Icône représentant la situation
}

export interface PositionComments {
    // Format: "mesAvantages_vs_leursAvantages"
    situations: {
        [key: string]: PositionAdvice;
    };
} 