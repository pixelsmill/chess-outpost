import { PositionAdvice } from './position-comments-base';

// === SITUATIONS ÉQUILIBRÉES : 1 vs 1 ===

export const BALANCED_SITUATIONS: { [key: string]: PositionAdvice } = {
    // Mon avantage matériel vs leurs avantages
    "materialBalance_vs_spaceControl": {
        "diagnosis": "L'adversaire contrôle l'espace mais vous avez plus de matériel",
        "prescription": "échangez les pièces actives",
        "icon": "⚖️"
    },
    "materialBalance_vs_pieceActivity": {
        "diagnosis": "L'adversaire a des pièces actives mais vous avez l'avantage matériel",
        "prescription": "simplifiez la position",
        "icon": "🔄"
    },
    "materialBalance_vs_kingSafety": {
        "diagnosis": "L'adversaire a un roi sûr mais vous avez plus de matériel",
        "prescription": "forcez les échanges",
        "icon": "🎯"
    },
    "materialBalance_vs_pawnStructure": {
        "diagnosis": "L'adversaire a une meilleure structure mais vous avez l'avantage matériel",
        "prescription": "créez des complications tactiques",
        "icon": "⚔️"
    },

    // Mon contrôle d'espace vs leurs avantages
    "spaceControl_vs_materialBalance": {
        "diagnosis": "Vous contrôlez l'espace mais l'adversaire a plus de matériel",
        "prescription": "utilisez votre mobilité pour créer des menaces",
        "icon": "🏃"
    },
    "spaceControl_vs_pieceActivity": {
        "diagnosis": "Vous contrôlez l'espace mais leurs pièces sont actives",
        "prescription": "limitez leurs pièces tout en activant les vôtres",
        "icon": "🎛️"
    },
    "spaceControl_vs_kingSafety": {
        "diagnosis": "Vous avez l'espace mais leur roi est sûr",
        "prescription": "préparez une attaque méthodique",
        "icon": "🎯"
    },
    "spaceControl_vs_pawnStructure": {
        "diagnosis": "Vous contrôlez l'espace mais leur structure est meilleure",
        "prescription": "avancez vos pions pour créer des faiblesses",
        "icon": "⚡"
    },

    // Mon activité vs leurs avantages
    "pieceActivity_vs_materialBalance": {
        "diagnosis": "Vos pièces sont actives mais l'adversaire a plus de matériel",
        "prescription": "cherchez des tactiques avant qu'il simplifie",
        "icon": "⚡"
    },
    "pieceActivity_vs_spaceControl": {
        "diagnosis": "Vos pièces sont actives mais l'adversaire contrôle l'espace",
        "prescription": "créez des ruptures pour libérer vos pièces",
        "icon": "💥"
    },
    "pieceActivity_vs_kingSafety": {
        "diagnosis": "Vos pièces sont actives mais leur roi est sûr",
        "prescription": "préparez une attaque coordonnée",
        "icon": "🎯"
    },
    "pieceActivity_vs_pawnStructure": {
        "diagnosis": "Vos pièces sont actives mais leur structure est meilleure",
        "prescription": "exploitez les faiblesses temporaires",
        "icon": "⚔️"
    },

    // Ma sécurité royale vs leurs avantages
    "kingSafety_vs_materialBalance": {
        "diagnosis": "Votre roi est sûr mais l'adversaire a plus de matériel",
        "prescription": "créez un jeu de contre-attaque",
        "icon": "🛡️"
    },
    "kingSafety_vs_spaceControl": {
        "diagnosis": "Votre roi est sûr mais l'adversaire contrôle l'espace",
        "prescription": "défendez patiemment et contre-attaquez",
        "icon": "⏳"
    },
    "kingSafety_vs_pieceActivity": {
        "diagnosis": "Votre roi est sûr mais leurs pièces sont actives",
        "prescription": "neutralisez leurs menaces puis prenez l'initiative",
        "icon": "🛡️"
    },
    "kingSafety_vs_pawnStructure": {
        "diagnosis": "Votre roi est sûr mais leur structure est meilleure",
        "prescription": "jouez activement avant que leur avantage se concrétise",
        "icon": "⚡"
    },

    // Ma structure vs leurs avantages
    "pawnStructure_vs_materialBalance": {
        "diagnosis": "Votre structure est meilleure mais l'adversaire a plus de matériel",
        "prescription": "créez un pion passé rapidement",
        "icon": "🏃"
    },
    "pawnStructure_vs_spaceControl": {
        "diagnosis": "Votre structure est meilleure mais l'adversaire contrôle l'espace",
        "prescription": "consolidez puis contre-attaquez",
        "icon": "⚖️"
    },
    "pawnStructure_vs_pieceActivity": {
        "diagnosis": "Votre structure est meilleure mais leurs pièces sont actives",
        "prescription": "défendez puis exploitez vos pions",
        "icon": "🛡️"
    },
    "pawnStructure_vs_kingSafety": {
        "diagnosis": "Votre structure est meilleure mais leur roi est sûr",
        "prescription": "préparez un plan à long terme",
        "icon": "⏳"
    }
}; 