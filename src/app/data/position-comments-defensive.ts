import { PositionAdvice } from './position-comments-base';

// === CONSEILS DÉFENSIFS : Quand je n'ai pas d'avantages face à leurs avantages ===

export const DEFENSIVE_SITUATIONS: { [key: string]: PositionAdvice } = {
    // Face à un seul avantage adverse
    "_vs_materialBalance": {
        "diagnosis": "L'adversaire a un avantage matériel",
        "prescription": "cherchez des complications tactiques ou un contre-jeu actif",
        "direction": "defense"
    },
    "_vs_spaceControl": {
        "diagnosis": "L'adversaire contrôle mieux l'espace",
        "prescription": "échangez des pièces ou cherchez des ruptures de pions",
        "direction": "defense"
    },
    "_vs_pieceActivity": {
        "diagnosis": "L'adversaire a des pièces plus actives",
        "prescription": "consolidez votre position et neutralisez leurs menaces",
        "direction": "blocking"
    },
    "_vs_kingSafety": {
        "diagnosis": "L'adversaire a un roi mieux protégé",
        "prescription": "créez des menaces ailleurs ou renforcez votre propre sécurité",
        "direction": "defense"
    },
    "_vs_pawnStructure": {
        "diagnosis": "L'adversaire a une meilleure structure de pions",
        "prescription": "jouez activement avant que leur avantage se concrétise",
        "direction": "reorganization"
    },

    // Face à deux avantages adverses
    "_vs_materialBalance_spaceControl": {
        "diagnosis": "L'adversaire a l'avantage matériel et contrôle l'espace",
        "prescription": "simplifiez pour neutraliser leur pression multiple",
        "direction": "blocking"
    },
    "_vs_materialBalance_pieceActivity": {
        "diagnosis": "L'adversaire a l'avantage matériel et des pièces actives",
        "prescription": "défendez avec précision et guettez les opportunités tactiques",
        "direction": "attack"
    },
    "_vs_materialBalance_kingSafety": {
        "diagnosis": "L'adversaire a l'avantage matériel et un roi sûr",
        "prescription": "créez immédiatement du contre-jeu avant la simplification",
        "direction": "imbalance"
    },
    "_vs_materialBalance_pawnStructure": {
        "diagnosis": "L'adversaire a l'avantage matériel et une meilleure structure",
        "prescription": "cherchez des complications pour éviter la finale",
        "direction": "imbalance"
    },
    "_vs_spaceControl_pieceActivity": {
        "diagnosis": "L'adversaire presse sur plusieurs fronts",
        "prescription": "échangez les pièces actives et libérez votre jeu",
        "direction": "simplification"
    },
    "_vs_spaceControl_kingSafety": {
        "diagnosis": "L'adversaire contrôle l'espace avec un roi sûr",
        "prescription": "patience défensive puis contre-attaque coordonnée",
        "direction": "simplification"
    },
    "_vs_spaceControl_pawnStructure": {
        "diagnosis": "L'adversaire contrôle l'espace et a une meilleure structure",
        "prescription": "créez des ruptures avant que leur avantage s'amplifie",
        "direction": "imbalance"
    },
    "_vs_pieceActivity_kingSafety": {
        "diagnosis": "L'adversaire a des pièces actives et un roi sûr",
        "prescription": "neutralisez leurs pièces actives en priorité",
        "direction": "defense"
    },
    "_vs_pieceActivity_pawnStructure": {
        "diagnosis": "L'adversaire a des pièces actives et une meilleure structure",
        "prescription": "défendez solidement et attendez une opportunité",
        "direction": "simplification"
    },
    "_vs_kingSafety_pawnStructure": {
        "diagnosis": "L'adversaire a un roi sûr et une meilleure structure",
        "prescription": "jouez activement pour créer des complications",
        "direction": "imbalance"
    },

    // Face à trois avantages adverses (situations difficiles)
    "_vs_materialBalance_spaceControl_pieceActivity": {
        "diagnosis": "Position délicate face aux multiples avantages adverses",
        "prescription": "cherchez immédiatement des complications tactiques forcées",
        "direction": "defense"
    },
    "_vs_materialBalance_spaceControl_kingSafety": {
        "diagnosis": "L'adversaire domine sur plusieurs plans",
        "prescription": "défendez avec ténacité et guettez la moindre erreur",
        "direction": "activation"
    },
    "_vs_materialBalance_pieceActivity_kingSafety": {
        "diagnosis": "Situation exigeante mais pas désespérée",
        "prescription": "consolidez puis cherchez un contre-jeu forcé",
        "direction": "attack"
    },
    "_vs_spaceControl_pieceActivity_kingSafety": {
        "diagnosis": "L'adversaire presse de tous côtés",
        "prescription": "simplifiez pour réduire leur initiative multiple",
        "direction": "blocking"
    },

    // Face à quatre avantages adverses (très difficile)
    "_vs_materialBalance_spaceControl_pieceActivity_kingSafety": {
        "diagnosis": "Position très difficile nécessitant une défense parfaite",
        "prescription": "cherchez des ressources tactiques désespérées ou préparez la résistance",
        "direction": "defense"
    }
}; 
