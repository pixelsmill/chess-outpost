import { PositionAdvice } from './position-comments-base';

// === SITUATIONS AVANTAGEUSES : 2 vs 1 ===

export const ADVANTAGEOUS_SITUATIONS: { [key: string]: PositionAdvice } = {
    // Mes 2 avantages vs leur 1 avantage
    "materialBalance_spaceControl_vs_pieceActivity": {
        "diagnosis": "Vous avez l'avantage matériel et contrôlez l'espace contre leur activité",
        "prescription": "consolidez puis pressez",
        "icon": "💪"
    },
    "materialBalance_spaceControl_vs_kingSafety": {
        "diagnosis": "Vous avez l'avantage matériel et contrôlez l'espace contre leur roi sûr",
        "prescription": "avancez méthodiquement",
        "icon": "🎯"
    },
    "materialBalance_spaceControl_vs_pawnStructure": {
        "diagnosis": "Vous avez l'avantage matériel et contrôlez l'espace contre leur structure",
        "prescription": "créez des pions passés",
        "icon": "🏃"
    },
    "materialBalance_pieceActivity_vs_spaceControl": {
        "diagnosis": "Vous avez l'avantage matériel et des pièces actives contre leur espace",
        "prescription": "brisez leurs lignes",
        "icon": "💥"
    },
    "materialBalance_pieceActivity_vs_kingSafety": {
        "diagnosis": "Vous avez l'avantage matériel et des pièces actives contre leur roi sûr",
        "prescription": "attaquez avec précision",
        "icon": "🎯"
    },
    "materialBalance_pieceActivity_vs_pawnStructure": {
        "diagnosis": "Vous avez l'avantage matériel et des pièces actives contre leur structure",
        "prescription": "exploitez les faiblesses tactiques",
        "icon": "⚔️"
    },
    "materialBalance_kingSafety_vs_spaceControl": {
        "diagnosis": "Vous avez l'avantage matériel et un roi sûr contre leur espace",
        "prescription": "simplifiez vers une finale gagnante",
        "icon": "🏆"
    },
    "materialBalance_kingSafety_vs_pieceActivity": {
        "diagnosis": "Vous avez l'avantage matériel et un roi sûr contre leur activité",
        "prescription": "neutralisez puis exploitez",
        "icon": "🛡️"
    },
    "materialBalance_kingSafety_vs_pawnStructure": {
        "diagnosis": "Vous avez l'avantage matériel et un roi sûr contre leur structure",
        "prescription": "poussez vos pions passés",
        "icon": "🏃"
    },
    "materialBalance_pawnStructure_vs_spaceControl": {
        "diagnosis": "Vous avez l'avantage matériel et une meilleure structure contre leur espace",
        "prescription": "créez un pion passé lointain",
        "icon": "🎯"
    },
    "materialBalance_pawnStructure_vs_pieceActivity": {
        "diagnosis": "Vous avez l'avantage matériel et une meilleure structure contre leur activité",
        "prescription": "consolidez puis avancez",
        "icon": "⚖️"
    },
    "materialBalance_pawnStructure_vs_kingSafety": {
        "diagnosis": "Vous avez l'avantage matériel et une meilleure structure contre leur roi sûr",
        "prescription": "préparez une finale technique",
        "icon": "🎯"
    },

    "spaceControl_pieceActivity_vs_materialBalance": {
        "diagnosis": "Vous contrôlez l'espace et avez des pièces actives contre leur avantage matériel",
        "prescription": "attaquez avant qu'ils simplifient",
        "icon": "⚡"
    },
    "spaceControl_pieceActivity_vs_kingSafety": {
        "diagnosis": "Vous contrôlez l'espace et avez des pièces actives contre leur roi sûr",
        "prescription": "préparez une attaque coordonnée",
        "icon": "🎯"
    },
    "spaceControl_pieceActivity_vs_pawnStructure": {
        "diagnosis": "Vous contrôlez l'espace et avez des pièces actives contre leur structure",
        "prescription": "créez des ruptures",
        "icon": "💥"
    },
    "spaceControl_kingSafety_vs_materialBalance": {
        "diagnosis": "Vous contrôlez l'espace et avez un roi sûr contre leur avantage matériel",
        "prescription": "jouez positionellement",
        "icon": "⚖️"
    },
    "spaceControl_kingSafety_vs_pieceActivity": {
        "diagnosis": "Vous contrôlez l'espace et avez un roi sûr contre leur activité",
        "prescription": "contrôlez puis contre-attaquez",
        "icon": "🛡️"
    },
    "spaceControl_kingSafety_vs_pawnStructure": {
        "diagnosis": "Vous contrôlez l'espace et avez un roi sûr contre leur structure",
        "prescription": "avancez vos pions méthodiquement",
        "icon": "🏃"
    },
    "spaceControl_pawnStructure_vs_materialBalance": {
        "diagnosis": "Vous contrôlez l'espace et avez une meilleure structure contre leur avantage matériel",
        "prescription": "créez des pions passés",
        "icon": "🎯"
    },
    "spaceControl_pawnStructure_vs_pieceActivity": {
        "diagnosis": "Vous contrôlez l'espace et avez une meilleure structure contre leur activité",
        "prescription": "consolidez votre position",
        "icon": "🔒"
    },
    "spaceControl_pawnStructure_vs_kingSafety": {
        "diagnosis": "Vous contrôlez l'espace et avez une meilleure structure contre leur roi sûr",
        "prescription": "préparez une poussée de pions",
        "icon": "🏃"
    },

    "pieceActivity_kingSafety_vs_materialBalance": {
        "diagnosis": "Vous avez des pièces actives et un roi sûr contre leur avantage matériel",
        "prescription": "attaquez rapidement",
        "icon": "⚡"
    },
    "pieceActivity_kingSafety_vs_spaceControl": {
        "diagnosis": "Vous avez des pièces actives et un roi sûr contre leur espace",
        "prescription": "brisez leurs lignes",
        "icon": "💥"
    },
    "pieceActivity_kingSafety_vs_pawnStructure": {
        "diagnosis": "Vous avez des pièces actives et un roi sûr contre leur structure",
        "prescription": "exploitez les faiblesses",
        "icon": "⚔️"
    },
    "pieceActivity_pawnStructure_vs_materialBalance": {
        "diagnosis": "Vous avez des pièces actives et une meilleure structure contre leur avantage matériel",
        "prescription": "créez des menaces tactiques",
        "icon": "⚔️"
    },
    "pieceActivity_pawnStructure_vs_spaceControl": {
        "diagnosis": "Vous avez des pièces actives et une meilleure structure contre leur espace",
        "prescription": "activez vos pions",
        "icon": "🎯"
    },
    "pieceActivity_pawnStructure_vs_kingSafety": {
        "diagnosis": "Vous avez des pièces actives et une meilleure structure contre leur roi sûr",
        "prescription": "coordonnez pièces et pions",
        "icon": "🎛️"
    },

    "kingSafety_pawnStructure_vs_materialBalance": {
        "diagnosis": "Vous avez un roi sûr et une meilleure structure contre leur avantage matériel",
        "prescription": "jouez patiemment",
        "icon": "⏳"
    },
    "kingSafety_pawnStructure_vs_spaceControl": {
        "diagnosis": "Vous avez un roi sûr et une meilleure structure contre leur espace",
        "prescription": "défendez puis contre-attaquez",
        "icon": "🛡️"
    },
    "kingSafety_pawnStructure_vs_pieceActivity": {
        "diagnosis": "Vous avez un roi sûr et une meilleure structure contre leur activité",
        "prescription": "neutralisez puis exploitez",
        "icon": "🛡️"
    },

    // === 1 vs 2 : MON 1 AVANTAGE vs LEURS 2 AVANTAGES ===
    "materialBalance_vs_spaceControl_pieceActivity": {
        "diagnosis": "Vous avez un avantage statique contre leur pression dynamique",
        "prescription": "simplifiez immédiatement",
        "icon": "🔄"
    },
    "materialBalance_vs_spaceControl_kingSafety": {
        "diagnosis": "Vous avez l'avantage matériel contre leur contrôle d'espace",
        "prescription": "réduisez leur mobilité par des échanges ciblés",
        "icon": "🔒"
    },
    "materialBalance_vs_spaceControl_pawnStructure": {
        "diagnosis": "Vous avez l'avantage matériel contre leur contrôle d'espace",
        "prescription": "brisez leur contrôle spatial par des complications",
        "icon": "💥"
    },
    "materialBalance_vs_pieceActivity_kingSafety": {
        "diagnosis": "Vous avez l'avantage matériel contre leur activité",
        "prescription": "échangez leurs pièces actives pour neutraliser leur jeu",
        "icon": "🔄"
    },
    "materialBalance_vs_pieceActivity_pawnStructure": {
        "diagnosis": "Vous avez l'avantage matériel contre leur activité",
        "prescription": "simplifiez pour éliminer leur compensation temporaire",
        "icon": "🔄"
    },
    "materialBalance_vs_kingSafety_pawnStructure": {
        "diagnosis": "Vous avez l'avantage matériel contre leur solidité défensive",
        "prescription": "créez des complications tactiques",
        "icon": "⚔️"
    },

    "spaceControl_vs_materialBalance_pieceActivity": {
        "diagnosis": "Vous contrôlez l'espace contre leur avantage matériel",
        "prescription": "exploitez votre mobilité avant qu'ils échangent",
        "icon": "🏃"
    },
    "spaceControl_vs_materialBalance_kingSafety": {
        "diagnosis": "Vous contrôlez l'espace contre leur avantage matériel",
        "prescription": "attaquez maintenant avant leur consolidation",
        "icon": "⚡"
    },
    "spaceControl_vs_materialBalance_pawnStructure": {
        "diagnosis": "Vous contrôlez l'espace contre leur avantage matériel",
        "prescription": "forcez des ruptures avant qu'ils simplifient",
        "icon": "💥"
    },
    "spaceControl_vs_pieceActivity_kingSafety": {
        "diagnosis": "Vous avez l'espace contre leurs pièces actives et leur roi sûr",
        "prescription": "limitez leurs pièces puis pressez",
        "icon": "🔒"
    },
    "spaceControl_vs_pieceActivity_pawnStructure": {
        "diagnosis": "Vous avez l'espace contre leurs pièces actives et leur structure",
        "prescription": "avancez vos pions pour gêner",
        "icon": "🏃"
    },
    "spaceControl_vs_kingSafety_pawnStructure": {
        "diagnosis": "Vous avez l'espace contre leur roi sûr et leur structure",
        "prescription": "préparez une attaque méthodique",
        "icon": "🎯"
    },

    "pieceActivity_vs_materialBalance_spaceControl": {
        "diagnosis": "Vos pièces sont actives contre leur avantage matériel",
        "prescription": "convertissez votre activité en gain matériel concret",
        "icon": "⚡"
    },
    "pieceActivity_vs_materialBalance_kingSafety": {
        "diagnosis": "Vos pièces sont actives contre leur avantage matériel",
        "prescription": "forcez des gains tactiques avant qu'ils neutralisent vos pièces",
        "icon": "⚔️"
    },
    "pieceActivity_vs_materialBalance_pawnStructure": {
        "diagnosis": "Vos pièces sont actives contre leur avantage matériel",
        "prescription": "exploitez vos pièces pour réduire leur supériorité matérielle",
        "icon": "⚔️"
    },
    "pieceActivity_vs_spaceControl_kingSafety": {
        "diagnosis": "Vous avez l'activité contre leur espace et leur roi sûr",
        "prescription": "créez des ruptures pour vos pièces",
        "icon": "💥"
    },
    "pieceActivity_vs_spaceControl_pawnStructure": {
        "diagnosis": "Vous avez l'activité contre leur espace et leur structure",
        "prescription": "cherchez des tactiques immédiates",
        "icon": "⚡"
    },
    "pieceActivity_vs_kingSafety_pawnStructure": {
        "diagnosis": "Vous avez l'activité contre leur roi sûr et leur structure",
        "prescription": "coordonnez une attaque puissante",
        "icon": "🎯"
    },

    "kingSafety_vs_materialBalance_spaceControl": {
        "diagnosis": "Vous avez le roi sûr contre leur avantage matériel et leur espace",
        "prescription": "défendez puis contre-attaquez",
        "icon": "🛡️"
    },
    "kingSafety_vs_materialBalance_pieceActivity": {
        "diagnosis": "Vous avez le roi sûr contre leur avantage matériel et leurs pièces actives",
        "prescription": "neutralisez leurs menaces",
        "icon": "🛡️"
    },
    "kingSafety_vs_materialBalance_pawnStructure": {
        "diagnosis": "Vous avez le roi sûr contre leur avantage matériel et leur structure",
        "prescription": "créez des contre-chances",
        "icon": "🎯"
    },
    "kingSafety_vs_spaceControl_pieceActivity": {
        "diagnosis": "Vous avez un avantage statique contre leur pression dynamique",
        "prescription": "défendez fermement puis exploitez leurs faiblesses",
        "icon": "🛡️"
    },
    "kingSafety_vs_spaceControl_pawnStructure": {
        "diagnosis": "Vous avez le roi sûr contre leur espace et leur structure",
        "prescription": "patience et contre-jeu",
        "icon": "⏳"
    },
    "kingSafety_vs_pieceActivity_pawnStructure": {
        "diagnosis": "Vous avez le roi sûr contre leurs pièces actives et leur structure",
        "prescription": "neutralisez puis exploitez",
        "icon": "🛡️"
    },

    "pawnStructure_vs_materialBalance_spaceControl": {
        "diagnosis": "Vous avez la structure contre leur avantage matériel et leur espace",
        "prescription": "créez un pion passé rapidement",
        "icon": "🏃"
    },
    "pawnStructure_vs_materialBalance_pieceActivity": {
        "diagnosis": "Vous avez la structure contre leur avantage matériel et leurs pièces actives",
        "prescription": "consolidez puis avancez vos pions",
        "icon": "🔒"
    },
    "pawnStructure_vs_materialBalance_kingSafety": {
        "diagnosis": "Vous avez la structure contre leur avantage matériel et leur roi sûr",
        "prescription": "patience et plan à long terme",
        "icon": "⏳"
    },
    "pawnStructure_vs_spaceControl_pieceActivity": {
        "diagnosis": "Vous avez un avantage statique contre leur pression dynamique",
        "prescription": "défendez puis exploitez vos pions",
        "icon": "🛡️"
    },
    "pawnStructure_vs_spaceControl_kingSafety": {
        "diagnosis": "Vous avez la structure contre leur espace et leur roi sûr",
        "prescription": "préparez une poussée de pions",
        "icon": "🏃"
    },
    "pawnStructure_vs_pieceActivity_kingSafety": {
        "diagnosis": "Vous avez la structure contre leurs pièces actives et leur roi sûr",
        "prescription": "consolidez puis créez un pion passé",
        "icon": "🔒"
    }
}; 