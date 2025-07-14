import { PositionAdvice } from './position-comments-base';

// === SITUATIONS ÉQUILIBRÉES : 1 vs 1 ===

export const BALANCED_SITUATIONS: { [key: string]: PositionAdvice } = {
    // Mon avantage matériel vs leurs avantages
    "materialBalance_vs_spaceControl": {
        "diagnosis": "L'adversaire contrôle l'espace mais vous avez plus de matériel",
        "prescription": "échangez les pièces actives",
        "direction": "reorganization"
    },
    "materialBalance_vs_pieceActivity": {
        "diagnosis": "L'adversaire a des pièces actives mais vous avez l'avantage matériel",
        "prescription": "simplifiez la position",
        "direction": "simplification"
    },
    "materialBalance_vs_kingSafety": {
        "diagnosis": "L'adversaire a un roi sûr mais vous avez plus de matériel",
        "prescription": "forcez les échanges",
        "direction": "pressure"
    },
    "materialBalance_vs_pawnStructure": {
        "diagnosis": "L'adversaire a une meilleure structure mais vous avez l'avantage matériel",
        "prescription": "créez des complications tactiques",
        "direction": "attack"
    },

    // Mon contrôle d'espace vs leurs avantages
    "spaceControl_vs_materialBalance": {
        "diagnosis": "Vous contrôlez l'espace mais l'adversaire a plus de matériel",
        "prescription": "utilisez votre mobilité pour créer des menaces",
        "direction": "activation"
    },
    "spaceControl_vs_pieceActivity": {
        "diagnosis": "Vous contrôlez l'espace mais leurs pièces sont actives",
        "prescription": "limitez leurs pièces tout en activant les vôtres",
        "direction": "reorganization"
    },
    "spaceControl_vs_kingSafety": {
        "diagnosis": "Vous avez l'espace mais leur roi est sûr",
        "prescription": "préparez une attaque méthodique",
        "direction": "pressure"
    },
    "spaceControl_vs_pawnStructure": {
        "diagnosis": "Vous contrôlez l'espace mais leur structure est meilleure",
        "prescription": "avancez vos pions pour créer des faiblesses",
        "direction": "imbalance"
    },

    // Mon activité vs leurs avantages
    "pieceActivity_vs_materialBalance": {
        "diagnosis": "Vos pièces sont actives mais l'adversaire a plus de matériel",
        "prescription": "cherchez des tactiques avant qu'il simplifie",
        "direction": "attack"
    },
    "pieceActivity_vs_spaceControl": {
        "diagnosis": "Vos pièces sont actives mais l'adversaire contrôle l'espace",
        "prescription": "créez des ruptures pour libérer vos pièces",
        "direction": "imbalance"
    },
    "pieceActivity_vs_kingSafety": {
        "diagnosis": "Vos pièces sont actives mais leur roi est sûr",
        "prescription": "préparez une attaque coordonnée",
        "direction": "attack"
    },
    "pieceActivity_vs_pawnStructure": {
        "diagnosis": "Vos pièces sont actives mais leur structure est meilleure",
        "prescription": "exploitez les faiblesses temporaires",
        "direction": "pressure"
    },

    // Ma sécurité royale vs leurs avantages
    "kingSafety_vs_materialBalance": {
        "diagnosis": "Votre roi est sûr mais l'adversaire a plus de matériel",
        "prescription": "créez un jeu de contre-attaque",
        "direction": "defense"
    },
    "kingSafety_vs_spaceControl": {
        "diagnosis": "Votre roi est sûr mais l'adversaire contrôle l'espace",
        "prescription": "défendez patiemment et contre-attaquez",
        "direction": "simplification"
    },
    "kingSafety_vs_pieceActivity": {
        "diagnosis": "Votre roi est sûr mais leurs pièces sont actives",
        "prescription": "neutralisez leurs menaces puis prenez l'initiative",
        "direction": "defense"
    },
    "kingSafety_vs_pawnStructure": {
        "diagnosis": "Votre roi est sûr mais leur structure est meilleure",
        "prescription": "jouez activement avant que leur avantage se concrétise",
        "direction": "activation"
    },

    // Ma structure vs leurs avantages
    "pawnStructure_vs_materialBalance": {
        "diagnosis": "Votre structure est meilleure mais l'adversaire a plus de matériel",
        "prescription": "créez un pion passé rapidement",
        "direction": "activation"
    },
    "pawnStructure_vs_spaceControl": {
        "diagnosis": "Votre structure est meilleure mais l'adversaire contrôle l'espace",
        "prescription": "consolidez puis contre-attaquez",
        "direction": "reorganization"
    },
    "pawnStructure_vs_pieceActivity": {
        "diagnosis": "Votre structure est meilleure mais leurs pièces sont actives",
        "prescription": "défendez puis exploitez vos pions",
        "direction": "defense"
    },
    "pawnStructure_vs_kingSafety": {
        "diagnosis": "Votre structure est meilleure mais leur roi est sûr",
        "prescription": "préparez un plan à long terme",
        "direction": "simplification"
    }
};

