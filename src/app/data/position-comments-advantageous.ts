import { PositionAdvice } from './position-comments-base';

// === SITUATIONS AVANTAGEUSES : 2 vs 1 ===

export const ADVANTAGEOUS_SITUATIONS: { [key: string]: PositionAdvice } = {
    // Mes 2 avantages vs leur 1 avantage
    "materialBalance_spaceControl_vs_pieceActivity": {
        "diagnosis": "Vous avez l'avantage matériel et contrôlez l'espace contre leur activité",
        "prescription": "consolidez puis pressez",
        "direction": "activation"
    },
    "materialBalance_spaceControl_vs_kingSafety": {
        "diagnosis": "Vous avez l'avantage matériel et contrôlez l'espace contre leur roi sûr",
        "prescription": "avancez méthodiquement",
        "direction": "attack"
    },
    "materialBalance_spaceControl_vs_pawnStructure": {
        "diagnosis": "Vous avez l'avantage matériel et contrôlez l'espace contre leur structure",
        "prescription": "créez des pions passés",
        "direction": "activation"
    },
    "materialBalance_pieceActivity_vs_spaceControl": {
        "diagnosis": "Vous avez l'avantage matériel et des pièces actives contre leur espace",
        "prescription": "brisez leurs lignes",
        "direction": "imbalance"
    },
    "materialBalance_pieceActivity_vs_kingSafety": {
        "diagnosis": "Vous avez l'avantage matériel et des pièces actives contre leur roi sûr",
        "prescription": "attaquez avec précision",
        "direction": "attack"
    },
    "materialBalance_pieceActivity_vs_pawnStructure": {
        "diagnosis": "Vous avez l'avantage matériel et des pièces actives contre leur structure",
        "prescription": "exploitez les faiblesses tactiques",
        "direction": "pressure"
    },
    "materialBalance_kingSafety_vs_spaceControl": {
        "diagnosis": "Vous avez l'avantage matériel et un roi sûr contre leur espace",
        "prescription": "simplifiez vers une finale gagnante",
        "direction": "simplification"
    },
    "materialBalance_kingSafety_vs_pieceActivity": {
        "diagnosis": "Vous avez l'avantage matériel et un roi sûr contre leur activité",
        "prescription": "neutralisez puis exploitez",
        "direction": "defense"
    },
    "materialBalance_kingSafety_vs_pawnStructure": {
        "diagnosis": "Vous avez l'avantage matériel et un roi sûr contre leur structure",
        "prescription": "poussez vos pions passés",
        "direction": "activation"
    },
    "materialBalance_pawnStructure_vs_spaceControl": {
        "diagnosis": "Vous avez l'avantage matériel et une meilleure structure contre leur espace",
        "prescription": "créez un pion passé lointain",
        "direction": "pressure"
    },
    "materialBalance_pawnStructure_vs_pieceActivity": {
        "diagnosis": "Vous avez l'avantage matériel et une meilleure structure contre leur activité",
        "prescription": "consolidez puis avancez",
        "direction": "reorganization"
    },
    "materialBalance_pawnStructure_vs_kingSafety": {
        "diagnosis": "Vous avez l'avantage matériel et une meilleure structure contre leur roi sûr",
        "prescription": "préparez une finale technique",
        "direction": "reorganization"
    },

    "spaceControl_pieceActivity_vs_materialBalance": {
        "diagnosis": "Vous contrôlez l'espace et avez des pièces actives contre leur avantage matériel",
        "prescription": "attaquez avant qu'ils simplifient",
        "direction": "imbalance"
    },
    "spaceControl_pieceActivity_vs_kingSafety": {
        "diagnosis": "Vous contrôlez l'espace et avez des pièces actives contre leur roi sûr",
        "prescription": "préparez une attaque coordonnée",
        "direction": "attack"
    },
    "spaceControl_pieceActivity_vs_pawnStructure": {
        "diagnosis": "Vous contrôlez l'espace et avez des pièces actives contre leur structure",
        "prescription": "créez des ruptures",
        "direction": "imbalance"
    },
    "spaceControl_kingSafety_vs_materialBalance": {
        "diagnosis": "Vous contrôlez l'espace et avez un roi sûr contre leur avantage matériel",
        "prescription": "jouez positionellement",
        "direction": "reorganization"
    },
    "spaceControl_kingSafety_vs_pieceActivity": {
        "diagnosis": "Vous contrôlez l'espace et avez un roi sûr contre leur activité",
        "prescription": "contrôlez puis contre-attaquez",
        "direction": "defense"
    },
    "spaceControl_kingSafety_vs_pawnStructure": {
        "diagnosis": "Vous contrôlez l'espace et avez un roi sûr contre leur structure",
        "prescription": "avancez vos pions méthodiquement",
        "direction": "activation"
    },
    "spaceControl_pawnStructure_vs_materialBalance": {
        "diagnosis": "Vous contrôlez l'espace et avez une meilleure structure contre leur avantage matériel",
        "prescription": "créez des pions passés",
        "direction": "pressure"
    },
    "spaceControl_pawnStructure_vs_pieceActivity": {
        "diagnosis": "Vous contrôlez l'espace et avez une meilleure structure contre leur activité",
        "prescription": "consolidez votre position",
        "direction": "blocking"
    },
    "spaceControl_pawnStructure_vs_kingSafety": {
        "diagnosis": "Vous contrôlez l'espace et avez une meilleure structure contre leur roi sûr",
        "prescription": "préparez une poussée de pions",
        "direction": "activation"
    },

    "pieceActivity_kingSafety_vs_materialBalance": {
        "diagnosis": "Vous avez des pièces actives et un roi sûr contre leur avantage matériel",
        "prescription": "attaquez rapidement",
        "direction": "attack"
    },
    "pieceActivity_kingSafety_vs_spaceControl": {
        "diagnosis": "Vous avez des pièces actives et un roi sûr contre leur espace",
        "prescription": "brisez leurs lignes",
        "direction": "imbalance"
    },
    "pieceActivity_kingSafety_vs_pawnStructure": {
        "diagnosis": "Vous avez des pièces actives et un roi sûr contre leur structure",
        "prescription": "exploitez les faiblesses",
        "direction": "pressure"
    },
    "pieceActivity_pawnStructure_vs_materialBalance": {
        "diagnosis": "Vous avez des pièces actives et une meilleure structure contre leur avantage matériel",
        "prescription": "créez des menaces tactiques",
        "direction": "attack"
    },
    "pieceActivity_pawnStructure_vs_spaceControl": {
        "diagnosis": "Vous avez des pièces actives et une meilleure structure contre leur espace",
        "prescription": "activez vos pions",
        "direction": "activation"
    },
    "pieceActivity_pawnStructure_vs_kingSafety": {
        "diagnosis": "Vous avez des pièces actives et une meilleure structure contre leur roi sûr",
        "prescription": "coordonnez pièces et pions",
        "direction": "reorganization"
    },

    "kingSafety_pawnStructure_vs_materialBalance": {
        "diagnosis": "Vous avez un roi sûr et une meilleure structure contre leur avantage matériel",
        "prescription": "jouez patiemment",
        "direction": "simplification"
    },
    "kingSafety_pawnStructure_vs_spaceControl": {
        "diagnosis": "Vous avez un roi sûr et une meilleure structure contre leur espace",
        "prescription": "défendez puis contre-attaquez",
        "direction": "defense"
    },
    "kingSafety_pawnStructure_vs_pieceActivity": {
        "diagnosis": "Vous avez un roi sûr et une meilleure structure contre leur activité",
        "prescription": "neutralisez puis exploitez",
        "direction": "defense"
    },

    // === 1 vs 2 : MON 1 AVANTAGE vs LEURS 2 AVANTAGES ===
    "materialBalance_vs_spaceControl_pieceActivity": {
        "diagnosis": "Vous avez un avantage statique contre leur pression dynamique",
        "prescription": "simplifiez immédiatement",
        "direction": "simplification"
    },
    "materialBalance_vs_spaceControl_kingSafety": {
        "diagnosis": "Vous avez l'avantage matériel contre leur contrôle d'espace",
        "prescription": "réduisez leur mobilité par des échanges ciblés",
        "direction": "blocking"
    },
    "materialBalance_vs_spaceControl_pawnStructure": {
        "diagnosis": "Vous avez l'avantage matériel contre leur contrôle d'espace",
        "prescription": "brisez leur contrôle spatial par des complications",
        "direction": "imbalance"
    },
    "materialBalance_vs_pieceActivity_kingSafety": {
        "diagnosis": "Vous avez l'avantage matériel contre leur activité",
        "prescription": "échangez leurs pièces actives pour neutraliser leur jeu",
        "direction": "simplification"
    },
    "materialBalance_vs_pieceActivity_pawnStructure": {
        "diagnosis": "Vous avez l'avantage matériel contre leur activité",
        "prescription": "simplifiez pour éliminer leur compensation temporaire",
        "direction": "simplification"
    },
    "materialBalance_vs_kingSafety_pawnStructure": {
        "diagnosis": "Vous avez l'avantage matériel contre leur solidité défensive",
        "prescription": "créez des complications tactiques",
        "direction": "attack"
    },

    "spaceControl_vs_materialBalance_pieceActivity": {
        "diagnosis": "Vous contrôlez l'espace contre leur avantage matériel",
        "prescription": "exploitez votre mobilité avant qu'ils échangent",
        "direction": "activation"
    },
    "spaceControl_vs_materialBalance_kingSafety": {
        "diagnosis": "Vous contrôlez l'espace contre leur avantage matériel",
        "prescription": "attaquez maintenant avant leur consolidation",
        "direction": "attack"
    },
    "spaceControl_vs_materialBalance_pawnStructure": {
        "diagnosis": "Vous contrôlez l'espace contre leur avantage matériel",
        "prescription": "forcez des ruptures avant qu'ils simplifient",
        "direction": "imbalance"
    },
    "spaceControl_vs_pieceActivity_kingSafety": {
        "diagnosis": "Vous avez l'espace contre leurs pièces actives et leur roi sûr",
        "prescription": "limitez leurs pièces puis pressez",
        "direction": "blocking"
    },
    "spaceControl_vs_pieceActivity_pawnStructure": {
        "diagnosis": "Vous avez l'espace contre leurs pièces actives et leur structure",
        "prescription": "avancez vos pions pour gêner",
        "direction": "activation"
    },
    "spaceControl_vs_kingSafety_pawnStructure": {
        "diagnosis": "Vous avez l'espace contre leur roi sûr et leur structure",
        "prescription": "préparez une attaque méthodique",
        "direction": "pressure"
    },

    "pieceActivity_vs_materialBalance_spaceControl": {
        "diagnosis": "Vos pièces sont actives contre leur avantage matériel",
        "prescription": "convertissez votre activité en gain matériel concret",
        "direction": "imbalance"
    },
    "pieceActivity_vs_materialBalance_kingSafety": {
        "diagnosis": "Vos pièces sont actives contre leur avantage matériel",
        "prescription": "forcez des gains tactiques avant qu'ils neutralisent vos pièces",
        "direction": "attack"
    },
    "pieceActivity_vs_materialBalance_pawnStructure": {
        "diagnosis": "Vos pièces sont actives contre leur avantage matériel",
        "prescription": "exploitez vos pièces pour réduire leur supériorité matérielle",
        "direction": "attack"
    },
    "pieceActivity_vs_spaceControl_kingSafety": {
        "diagnosis": "Vous avez l'activité contre leur espace et leur roi sûr",
        "prescription": "créez des ruptures pour vos pièces",
        "direction": "imbalance"
    },
    "pieceActivity_vs_spaceControl_pawnStructure": {
        "diagnosis": "Vous avez l'activité contre leur espace et leur structure",
        "prescription": "cherchez des tactiques immédiates",
        "direction": "attack"
    },
    "pieceActivity_vs_kingSafety_pawnStructure": {
        "diagnosis": "Vous avez l'activité contre leur roi sûr et leur structure",
        "prescription": "coordonnez une attaque puissante",
        "direction": "attack"
    },

    "kingSafety_vs_materialBalance_spaceControl": {
        "diagnosis": "Vous avez le roi sûr contre leur avantage matériel et leur espace",
        "prescription": "défendez puis contre-attaquez",
        "direction": "defense"
    },
    "kingSafety_vs_materialBalance_pieceActivity": {
        "diagnosis": "Vous avez le roi sûr contre leur avantage matériel et leurs pièces actives",
        "prescription": "neutralisez leurs menaces",
        "direction": "defense"
    },
    "kingSafety_vs_materialBalance_pawnStructure": {
        "diagnosis": "Vous avez le roi sûr contre leur avantage matériel et leur structure",
        "prescription": "créez des contre-chances",
        "direction": "pressure"
    },
    "kingSafety_vs_spaceControl_pieceActivity": {
        "diagnosis": "Vous avez un avantage statique contre leur pression dynamique",
        "prescription": "défendez fermement puis exploitez leurs faiblesses",
        "direction": "defense"
    },
    "kingSafety_vs_spaceControl_pawnStructure": {
        "diagnosis": "Vous avez le roi sûr contre leur espace et leur structure",
        "prescription": "patience et contre-jeu",
        "direction": "simplification"
    },
    "kingSafety_vs_pieceActivity_pawnStructure": {
        "diagnosis": "Vous avez le roi sûr contre leurs pièces actives et leur structure",
        "prescription": "neutralisez puis exploitez",
        "direction": "defense"
    },

    "pawnStructure_vs_materialBalance_spaceControl": {
        "diagnosis": "Vous avez la structure contre leur avantage matériel et leur espace",
        "prescription": "créez un pion passé rapidement",
        "direction": "activation"
    },
    "pawnStructure_vs_materialBalance_pieceActivity": {
        "diagnosis": "Vous avez la structure contre leur avantage matériel et leurs pièces actives",
        "prescription": "consolidez puis avancez vos pions",
        "direction": "blocking"
    },
    "pawnStructure_vs_materialBalance_kingSafety": {
        "diagnosis": "Vous avez la structure contre leur avantage matériel et leur roi sûr",
        "prescription": "patience et plan à long terme",
        "direction": "simplification"
    },
    "pawnStructure_vs_spaceControl_pieceActivity": {
        "diagnosis": "Vous avez un avantage statique contre leur pression dynamique",
        "prescription": "défendez puis exploitez vos pions",
        "direction": "defense"
    },
    "pawnStructure_vs_spaceControl_kingSafety": {
        "diagnosis": "Vous avez la structure contre leur espace et leur roi sûr",
        "prescription": "préparez une poussée de pions",
        "direction": "activation"
    },
    "pawnStructure_vs_pieceActivity_kingSafety": {
        "diagnosis": "Vous avez la structure contre leurs pièces actives et leur roi sûr",
        "prescription": "consolidez puis créez un pion passé",
        "direction": "blocking"
    }
}; 
