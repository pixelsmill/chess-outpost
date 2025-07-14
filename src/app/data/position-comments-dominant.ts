import { PositionAdvice } from './position-comments-base';

// === SITUATIONS DOMINANTES : 2 vs 2 et plus ===

export const DOMINANT_SITUATIONS: { [key: string]: PositionAdvice } = {
    // === 2 vs 2 : MES 2 AVANTAGES vs LEURS 2 AVANTAGES ===
    "materialBalance_spaceControl_vs_pieceActivity_kingSafety": {
        "diagnosis": "Vous avez l'avantage matériel et contrôlez l'espace contre leurs pièces actives et leur roi sûr",
        "prescription": "jouez méthodiquement",
        "direction": "simplification"
    },
    "materialBalance_spaceControl_vs_pieceActivity_pawnStructure": {
        "diagnosis": "Vous avez l'avantage matériel et contrôlez l'espace contre leurs pièces actives et leur structure",
        "prescription": "pressez vos avantages",
        "direction": "activation"
    },
    "materialBalance_spaceControl_vs_kingSafety_pawnStructure": {
        "diagnosis": "Vous avez l'avantage matériel et contrôlez l'espace contre leur roi sûr et leur structure",
        "prescription": "créez des pions passés",
        "direction": "pressure"
    },
    "materialBalance_pieceActivity_vs_spaceControl_kingSafety": {
        "diagnosis": "Vous avez l'avantage matériel et des pièces actives contre leur espace et leur roi sûr",
        "prescription": "attaquez avec précision",
        "direction": "attack"
    },
    "materialBalance_pieceActivity_vs_spaceControl_pawnStructure": {
        "diagnosis": "Vous avez l'avantage matériel et des pièces actives contre leur espace et leur structure",
        "prescription": "brisez leurs lignes",
        "direction": "imbalance"
    },
    "materialBalance_pieceActivity_vs_kingSafety_pawnStructure": {
        "diagnosis": "Vous avez l'avantage matériel et des pièces actives contre leur roi sûr et leur structure",
        "prescription": "coordonnez l'attaque",
        "direction": "attack"
    },
    "materialBalance_kingSafety_vs_spaceControl_pieceActivity": {
        "diagnosis": "Vous avez un avantage statique contre leur pression dynamique",
        "prescription": "patientez, neutralisez leur activité puis exploitez votre solidité",
        "direction": "defense"
    },
    "materialBalance_kingSafety_vs_spaceControl_pawnStructure": {
        "diagnosis": "Vous avez l'avantage matériel et un roi sûr contre leur espace et leur structure",
        "prescription": "simplifiez vers une finale",
        "direction": "simplification"
    },
    "materialBalance_kingSafety_vs_pieceActivity_pawnStructure": {
        "diagnosis": "Vous avez l'avantage matériel et un roi sûr contre leurs pièces actives et leur structure",
        "prescription": "défendez puis pressez",
        "direction": "defense"
    },
    "materialBalance_pawnStructure_vs_spaceControl_pieceActivity": {
        "diagnosis": "Vous avez un avantage statique contre leur pression dynamique",
        "prescription": "résistez à leur pression temporaire puis imposez vos avantages durables",
        "direction": "defense"
    },
    "materialBalance_pawnStructure_vs_spaceControl_kingSafety": {
        "diagnosis": "Vous avez l'avantage matériel et une meilleure structure contre leur espace et leur roi sûr",
        "prescription": "créez un pion passé lointain",
        "direction": "pressure"
    },
    "materialBalance_pawnStructure_vs_pieceActivity_kingSafety": {
        "diagnosis": "Vous avez l'avantage matériel et une meilleure structure contre leurs pièces actives et leur roi sûr",
        "prescription": "jouez techniquement",
        "direction": "pressure"
    },
    "spaceControl_pieceActivity_vs_materialBalance_kingSafety": {
        "diagnosis": "Vous avez un avantage dynamique contre leur avantage matériel",
        "prescription": "agissez rapidement avant qu'ils simplifient",
        "direction": "imbalance"
    },
    "spaceControl_pieceActivity_vs_materialBalance_pawnStructure": {
        "diagnosis": "Vous avez un avantage dynamique contre leur avantage matériel",
        "prescription": "forcez les complications maintenant ou jamais",
        "direction": "imbalance"
    },
    "spaceControl_pieceActivity_vs_kingSafety_pawnStructure": {
        "diagnosis": "Vous avez un avantage dynamique contre leur solidité statique",
        "prescription": "attaquez maintenant, votre fenêtre d'action est limitée",
        "direction": "attack"
    },
    "spaceControl_kingSafety_vs_materialBalance_pieceActivity": {
        "diagnosis": "Vous contrôlez l'espace et avez un roi sûr contre leur avantage matériel et leurs pièces actives",
        "prescription": "contrôlez puis contre-attaquez",
        "direction": "defense"
    },
    "spaceControl_kingSafety_vs_materialBalance_pawnStructure": {
        "diagnosis": "Vous contrôlez l'espace et avez un roi sûr contre leur avantage matériel et leur structure",
        "prescription": "jouez positionellement",
        "direction": "reorganization"
    },
    "spaceControl_kingSafety_vs_pieceActivity_pawnStructure": {
        "diagnosis": "Vous contrôlez l'espace et avez un roi sûr contre leurs pièces actives et leur structure",
        "prescription": "limitez puis pressez",
        "direction": "blocking"
    },
    "spaceControl_pawnStructure_vs_materialBalance_pieceActivity": {
        "diagnosis": "Vous contrôlez l'espace et avez une meilleure structure contre leur avantage matériel et leurs pièces actives",
        "prescription": "consolidez votre position",
        "direction": "blocking"
    },
    "spaceControl_pawnStructure_vs_materialBalance_kingSafety": {
        "diagnosis": "Vous contrôlez l'espace et avez une meilleure structure contre leur avantage matériel et leur roi sûr",
        "prescription": "avancez vos pions",
        "direction": "activation"
    },
    "spaceControl_pawnStructure_vs_pieceActivity_kingSafety": {
        "diagnosis": "Vous contrôlez l'espace et avez une meilleure structure contre leurs pièces actives et leur roi sûr",
        "prescription": "préparez une poussée",
        "direction": "activation"
    },
    "pieceActivity_kingSafety_vs_materialBalance_spaceControl": {
        "diagnosis": "Vous avez des pièces actives et un roi sûr contre leur avantage matériel et leur espace",
        "prescription": "attaquez avec précision",
        "direction": "attack"
    },
    "pieceActivity_kingSafety_vs_materialBalance_pawnStructure": {
        "diagnosis": "Vous avez des pièces actives et un roi sûr contre leur avantage matériel et leur structure",
        "prescription": "exploitez les faiblesses",
        "direction": "pressure"
    },
    "pieceActivity_kingSafety_vs_spaceControl_pawnStructure": {
        "diagnosis": "Vous avez des pièces actives et un roi sûr contre leur espace et leur structure",
        "prescription": "brisez leurs lignes",
        "direction": "imbalance"
    },
    "pieceActivity_pawnStructure_vs_materialBalance_spaceControl": {
        "diagnosis": "Vous avez des pièces actives et une meilleure structure contre leur avantage matériel et leur espace",
        "prescription": "créez des menaces tactiques",
        "direction": "attack"
    },
    "pieceActivity_pawnStructure_vs_materialBalance_kingSafety": {
        "diagnosis": "Vous avez des pièces actives et une meilleure structure contre leur avantage matériel et leur roi sûr",
        "prescription": "coordonnez pièces et pions",
        "direction": "reorganization"
    },
    "pieceActivity_pawnStructure_vs_spaceControl_kingSafety": {
        "diagnosis": "Vous avez des pièces actives et une meilleure structure contre leur espace et leur roi sûr",
        "prescription": "activez vos pions",
        "direction": "activation"
    },
    "kingSafety_pawnStructure_vs_materialBalance_spaceControl": {
        "diagnosis": "Vous avez un roi sûr et une meilleure structure contre leur avantage matériel et leur espace",
        "prescription": "patience et solidité",
        "direction": "defense"
    },
    "kingSafety_pawnStructure_vs_materialBalance_pieceActivity": {
        "diagnosis": "Vous avez un roi sûr et une meilleure structure contre leur avantage matériel et leurs pièces actives",
        "prescription": "défendez puis exploitez",
        "direction": "defense"
    },
    "kingSafety_pawnStructure_vs_spaceControl_pieceActivity": {
        "diagnosis": "Vous avez un avantage statique contre leur pression dynamique",
        "prescription": "défendez solidement, leur activité s'estompera",
        "direction": "defense"
    },

    // === MES AVANTAGES vs AUCUN AVANTAGE ADVERSE ===
    "materialBalance_vs_": {
        "diagnosis": "Vous avez un avantage matériel sans opposition",
        "prescription": "pressez méthodiquement vers une finale gagnante",
        "direction": "simplification"
    },
    "spaceControl_vs_": {
        "diagnosis": "Vous dominez l'espace sans résistance",
        "prescription": "exploitez votre mobilité supérieure pour créer des faiblesses",
        "direction": "activation"
    },
    "pieceActivity_vs_": {
        "diagnosis": "Vos pièces sont nettement plus actives",
        "prescription": "convertissez cette activité en gains tangibles",
        "direction": "imbalance"
    },
    "kingSafety_vs_": {
        "diagnosis": "Votre roi est beaucoup mieux protégé",
        "prescription": "attaquez sans risque, votre position est solide",
        "direction": "attack"
    },
    "pawnStructure_vs_": {
        "diagnosis": "Votre structure de pions est nettement supérieure",
        "prescription": "avancez vos pions pour créer des faiblesses durables",
        "direction": "activation"
    },

    // === ÉGALITÉ TOTALE ===
    "_vs_": {
        "diagnosis": "Position parfaitement équilibrée",
        "prescription": "jouez pour de petites améliorations et restez patient",
        "direction": "activation"
    },

    // === MES MULTIPLES AVANTAGES vs AUCUN AVANTAGE ADVERSE ===

    // Mes 2 avantages vs rien
    "materialBalance_spaceControl_vs_": {
        "diagnosis": "Vous dominez avec l'avantage matériel et le contrôle de l'espace",
        "prescription": "convertissez méthodiquement vers une victoire technique",
        "direction": "simplification"
    },
    "materialBalance_pieceActivity_vs_": {
        "diagnosis": "Vous avez l'avantage matériel et des pièces plus actives",
        "prescription": "pressez sur tous les fronts pour une victoire rapide",
        "direction": "attack"
    },
    "materialBalance_kingSafety_vs_": {
        "diagnosis": "Vous avez l'avantage matériel et un roi sûr",
        "prescription": "simplifiez vers une finale gagnante en toute sécurité",
        "direction": "simplification"
    },
    "materialBalance_pawnStructure_vs_": {
        "diagnosis": "Vous dominez avec l'avantage matériel et une meilleure structure",
        "prescription": "créez des pions passés pour accélérer la victoire",
        "direction": "activation"
    },
    "spaceControl_pieceActivity_vs_": {
        "diagnosis": "Vous contrôlez l'espace avec des pièces actives",
        "prescription": "étouffez l'adversaire et cherchez la décision tactique",
        "direction": "attack"
    },
    "spaceControl_kingSafety_vs_": {
        "diagnosis": "Vous avez le contrôle de l'espace et un roi sûr",
        "prescription": "avancez méthodiquement sans prendre de risques",
        "direction": "activation"
    },
    "spaceControl_pawnStructure_vs_": {
        "diagnosis": "Vous dominez avec le contrôle de l'espace et une meilleure structure",
        "prescription": "poussez vos pions pour créer des faiblesses décisives",
        "direction": "activation"
    },
    "pieceActivity_kingSafety_vs_": {
        "diagnosis": "Vous avez des pièces actives et un roi sûr",
        "prescription": "attaquez sans retenue, votre position est idéale",
        "direction": "attack"
    },
    "pieceActivity_pawnStructure_vs_": {
        "diagnosis": "Vous avez des pièces actives et une structure supérieure",
        "prescription": "combinez pression immédiate et plan à long terme",
        "direction": "reorganization"
    },
    "kingSafety_pawnStructure_vs_": {
        "diagnosis": "Vous avez un roi sûr et une structure supérieure",
        "prescription": "jouez positionellement pour augmenter votre avantage",
        "direction": "reorganization"
    },

    // Mes 3 avantages vs rien
    "materialBalance_spaceControl_pieceActivity_vs_": {
        "diagnosis": "Domination totale : matériel, espace et activité",
        "prescription": "la victoire est acquise, jouez avec précision",
        "direction": "attack"
    },
    "materialBalance_spaceControl_kingSafety_vs_": {
        "diagnosis": "Position écrasante : matériel, espace et roi sûr",
        "prescription": "avancez méthodiquement vers une victoire certaine",
        "direction": "simplification"
    },
    "materialBalance_spaceControl_pawnStructure_vs_": {
        "diagnosis": "Domination stratégique : matériel, espace et structure",
        "prescription": "créez des pions passés lointains pour verrouiller la victoire",
        "direction": "activation"
    },
    "materialBalance_pieceActivity_kingSafety_vs_": {
        "diagnosis": "Avantage décisif : matériel, activité et roi sûr",
        "prescription": "attaquez massivement, l'adversaire est sans défense",
        "direction": "attack"
    },
    "materialBalance_pieceActivity_pawnStructure_vs_": {
        "diagnosis": "Domination technique : matériel, activité et structure",
        "prescription": "combinez pression tactique et avantage positionnel",
        "direction": "pressure"
    },
    "materialBalance_kingSafety_pawnStructure_vs_": {
        "diagnosis": "Avantage solide : matériel, roi sûr et structure",
        "prescription": "jouez techniquement pour convertir votre supériorité",
        "direction": "simplification"
    },
    "spaceControl_pieceActivity_kingSafety_vs_": {
        "diagnosis": "Domination complète : espace, activité et roi sûr",
        "prescription": "étouffez l'adversaire puis donnez le coup de grâce",
        "direction": "attack"
    },
    "spaceControl_pieceActivity_pawnStructure_vs_": {
        "diagnosis": "Pression totale : espace, activité et structure",
        "prescription": "avancez vos pions soutenus par vos pièces actives",
        "direction": "activation"
    },
    "spaceControl_kingSafety_pawnStructure_vs_": {
        "diagnosis": "Domination positionnelle : espace, roi sûr et structure",
        "prescription": "exploitez méthodiquement vos multiples avantages",
        "direction": "activation"
    },
    "pieceActivity_kingSafety_pawnStructure_vs_": {
        "diagnosis": "Supériorité tactique : activité, roi sûr et structure",
        "prescription": "activez vos pièces pour soutenir l'avance de vos pions",
        "direction": "activation"
    },

    // Mes 4 avantages vs rien (domination absolue)
    "materialBalance_spaceControl_pieceActivity_kingSafety_vs_": {
        "diagnosis": "Domination absolue sur tous les plans",
        "prescription": "la partie est virtuellement gagnée, ne gâchez pas",
        "direction": "simplification"
    },
    "materialBalance_spaceControl_pieceActivity_pawnStructure_vs_": {
        "diagnosis": "Écrasement total : tous les avantages sauf sécurité",
        "prescription": "forcez une conclusion rapide avant toute complication",
        "direction": "attack"
    },
    "materialBalance_spaceControl_kingSafety_pawnStructure_vs_": {
        "diagnosis": "Domination stratégique complète",
        "prescription": "avancez méthodiquement vos pions passés soutenus",
        "direction": "simplification"
    },
    "materialBalance_pieceActivity_kingSafety_pawnStructure_vs_": {
        "diagnosis": "Supériorité écrasante sur tous les fronts",
        "prescription": "coordonnez l'attaque finale avec vos multiples avantages",
        "direction": "attack"
    },
    "spaceControl_pieceActivity_kingSafety_pawnStructure_vs_": {
        "diagnosis": "Domination tactique et positionnelle absolue",
        "prescription": "étouffez progressivement toute résistance adverse",
        "direction": "attack"
    },

    // Mes 5 avantages vs rien (domination totale)
    "materialBalance_spaceControl_pieceActivity_kingSafety_pawnStructure_vs_": {
        "diagnosis": "Domination absolue : tous les avantages vous appartiennent",
        "prescription": "victoire acquise, jouez avec précision pour conclure",
        "direction": "simplification"
    }
};

