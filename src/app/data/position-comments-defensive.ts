import { PositionAdvice } from './position-comments-base';

// === CONSEILS DÉFENSIFS : Quand je n'ai pas d'avantages face à leurs avantages ===

export const DEFENSIVE_SITUATIONS: { [key: string]: PositionAdvice } = {
    // Face à un seul avantage adverse
    "_vs_materialBalance": {
        "diagnosis": "L'adversaire a un avantage matériel",
        "prescription": "cherchez des complications tactiques ou un contre-jeu actif",
        "icon": "⚔️"
    },
    "_vs_spaceControl": {
        "diagnosis": "L'adversaire contrôle mieux l'espace",
        "prescription": "échangez des pièces ou cherchez des ruptures de pions",
        "icon": "🔄"
    },
    "_vs_pieceActivity": {
        "diagnosis": "L'adversaire a des pièces plus actives",
        "prescription": "consolidez votre position et neutralisez leurs menaces",
        "icon": "🛡️"
    },
    "_vs_kingSafety": {
        "diagnosis": "L'adversaire a un roi mieux protégé",
        "prescription": "créez des menaces ailleurs ou renforcez votre propre sécurité",
        "icon": "🎯"
    },
    "_vs_pawnStructure": {
        "diagnosis": "L'adversaire a une meilleure structure de pions",
        "prescription": "jouez activement avant que leur avantage se concrétise",
        "icon": "⚡"
    },

    // Face à deux avantages adverses
    "_vs_materialBalance_spaceControl": {
        "diagnosis": "L'adversaire a l'avantage matériel et contrôle l'espace",
        "prescription": "simplifiez pour neutraliser leur pression multiple",
        "icon": "🔒"
    },
    "_vs_materialBalance_pieceActivity": {
        "diagnosis": "L'adversaire a l'avantage matériel et des pièces actives",
        "prescription": "défendez avec précision et guettez les opportunités tactiques",
        "icon": "🎯"
    },
    "_vs_materialBalance_kingSafety": {
        "diagnosis": "L'adversaire a l'avantage matériel et un roi sûr",
        "prescription": "créez immédiatement du contre-jeu avant la simplification",
        "icon": "⚡"
    },
    "_vs_materialBalance_pawnStructure": {
        "diagnosis": "L'adversaire a l'avantage matériel et une meilleure structure",
        "prescription": "cherchez des complications pour éviter la finale",
        "icon": "💥"
    },
    "_vs_spaceControl_pieceActivity": {
        "diagnosis": "L'adversaire presse sur plusieurs fronts",
        "prescription": "échangez les pièces actives et libérez votre jeu",
        "icon": "🔄"
    },
    "_vs_spaceControl_kingSafety": {
        "diagnosis": "L'adversaire contrôle l'espace avec un roi sûr",
        "prescription": "patience défensive puis contre-attaque coordonnée",
        "icon": "⏳"
    },
    "_vs_spaceControl_pawnStructure": {
        "diagnosis": "L'adversaire contrôle l'espace et a une meilleure structure",
        "prescription": "créez des ruptures avant que leur avantage s'amplifie",
        "icon": "💥"
    },
    "_vs_pieceActivity_kingSafety": {
        "diagnosis": "L'adversaire a des pièces actives et un roi sûr",
        "prescription": "neutralisez leurs pièces actives en priorité",
        "icon": "🛡️"
    },
    "_vs_pieceActivity_pawnStructure": {
        "diagnosis": "L'adversaire a des pièces actives et une meilleure structure",
        "prescription": "défendez solidement et attendez une opportunité",
        "icon": "⏳"
    },
    "_vs_kingSafety_pawnStructure": {
        "diagnosis": "L'adversaire a un roi sûr et une meilleure structure",
        "prescription": "jouez activement pour créer des complications",
        "icon": "⚡"
    },

    // Face à trois avantages adverses (situations difficiles)
    "_vs_materialBalance_spaceControl_pieceActivity": {
        "diagnosis": "Position délicate face aux multiples avantages adverses",
        "prescription": "cherchez immédiatement des complications tactiques forcées",
        "icon": "🚨"
    },
    "_vs_materialBalance_spaceControl_kingSafety": {
        "diagnosis": "L'adversaire domine sur plusieurs plans",
        "prescription": "défendez avec ténacité et guettez la moindre erreur",
        "icon": "💪"
    },
    "_vs_materialBalance_pieceActivity_kingSafety": {
        "diagnosis": "Situation exigeante mais pas désespérée",
        "prescription": "consolidez puis cherchez un contre-jeu forcé",
        "icon": "🎯"
    },
    "_vs_spaceControl_pieceActivity_kingSafety": {
        "diagnosis": "L'adversaire presse de tous côtés",
        "prescription": "simplifiez pour réduire leur initiative multiple",
        "icon": "🔒"
    },

    // Face à quatre avantages adverses (très difficile)
    "_vs_materialBalance_spaceControl_pieceActivity_kingSafety": {
        "diagnosis": "Position très difficile nécessitant une défense parfaite",
        "prescription": "cherchez des ressources tactiques désespérées ou préparez la résistance",
        "icon": "⚰️"
    }
}; 