export interface PositionAdvice {
    diagnosis: string;    // Description de la situation stratégique
    prescription: string; // Action recommandée
}

export interface PositionComments {
    // Format: "mesAvantages_vs_leursAvantages"
    situations: {
        [key: string]: PositionAdvice;
    };
}

export const POSITION_COMMENTS: PositionComments = {
    "situations": {
        // === CONSEILS DÉFENSIFS : Quand je n'ai pas d'avantages face à leurs avantages ===

        // Face à un seul avantage adverse
        "_vs_materialBalance": {
            "diagnosis": "L'adversaire a un avantage matériel",
            "prescription": "cherchez des complications tactiques ou un contre-jeu actif"
        },
        "_vs_spaceControl": {
            "diagnosis": "L'adversaire contrôle mieux l'espace",
            "prescription": "échangez des pièces ou cherchez des ruptures de pions"
        },
        "_vs_pieceActivity": {
            "diagnosis": "L'adversaire a des pièces plus actives",
            "prescription": "consolidez votre position et neutralisez leurs menaces"
        },
        "_vs_kingSafety": {
            "diagnosis": "L'adversaire a un roi mieux protégé",
            "prescription": "créez des menaces ailleurs ou renforcez votre propre sécurité"
        },
        "_vs_pawnStructure": {
            "diagnosis": "L'adversaire a une meilleure structure de pions",
            "prescription": "jouez activement avant que leur avantage se concrétise"
        },

        // Face à deux avantages adverses
        "_vs_materialBalance_spaceControl": {
            "diagnosis": "L'adversaire a l'avantage matériel et contrôle l'espace",
            "prescription": "simplifiez pour neutraliser leur pression multiple"
        },
        "_vs_materialBalance_pieceActivity": {
            "diagnosis": "L'adversaire a l'avantage matériel et des pièces actives",
            "prescription": "défendez avec précision et guettez les opportunités tactiques"
        },
        "_vs_materialBalance_kingSafety": {
            "diagnosis": "L'adversaire a l'avantage matériel et un roi sûr",
            "prescription": "créez immédiatement du contre-jeu avant la simplification"
        },
        "_vs_materialBalance_pawnStructure": {
            "diagnosis": "L'adversaire a l'avantage matériel et une meilleure structure",
            "prescription": "cherchez des complications pour éviter la finale"
        },
        "_vs_spaceControl_pieceActivity": {
            "diagnosis": "L'adversaire presse sur plusieurs fronts",
            "prescription": "échangez les pièces actives et libérez votre jeu"
        },
        "_vs_spaceControl_kingSafety": {
            "diagnosis": "L'adversaire contrôle l'espace avec un roi sûr",
            "prescription": "patience défensive puis contre-attaque coordonnée"
        },
        "_vs_spaceControl_pawnStructure": {
            "diagnosis": "L'adversaire contrôle l'espace et a une meilleure structure",
            "prescription": "créez des ruptures avant que leur avantage s'amplifie"
        },
        "_vs_pieceActivity_kingSafety": {
            "diagnosis": "L'adversaire a des pièces actives et un roi sûr",
            "prescription": "neutralisez leurs pièces actives en priorité"
        },
        "_vs_pieceActivity_pawnStructure": {
            "diagnosis": "L'adversaire a des pièces actives et une meilleure structure",
            "prescription": "défendez solidement et attendez une opportunité"
        },
        "_vs_kingSafety_pawnStructure": {
            "diagnosis": "L'adversaire a un roi sûr et une meilleure structure",
            "prescription": "jouez activement pour créer des complications"
        },

        // Face à trois avantages adverses (situations difficiles)
        "_vs_materialBalance_spaceControl_pieceActivity": {
            "diagnosis": "Position délicate face aux multiples avantages adverses",
            "prescription": "cherchez immédiatement des complications tactiques forcées"
        },
        "_vs_materialBalance_spaceControl_kingSafety": {
            "diagnosis": "L'adversaire domine sur plusieurs plans",
            "prescription": "défendez avec ténacité et guettez la moindre erreur"
        },
        "_vs_materialBalance_pieceActivity_kingSafety": {
            "diagnosis": "Situation exigeante mais pas désespérée",
            "prescription": "consolidez puis cherchez un contre-jeu forcé"
        },
        "_vs_spaceControl_pieceActivity_kingSafety": {
            "diagnosis": "L'adversaire presse de tous côtés",
            "prescription": "simplifiez pour réduire leur initiative multiple"
        },

        // Face à quatre avantages adverses (très difficile)
        "_vs_materialBalance_spaceControl_pieceActivity_kingSafety": {
            "diagnosis": "Position très difficile nécessitant une défense parfaite",
            "prescription": "cherchez des ressources tactiques désespérées ou préparez la résistance"
        },

        // === 1 vs 1 : CHAQUE AVANTAGE CONTRE CHAQUE AUTRE ===

        // Mon avantage matériel vs leurs avantages
        "materialBalance_vs_spaceControl": {
            "diagnosis": "L'adversaire contrôle l'espace mais vous avez plus de matériel",
            "prescription": "échangez les pièces actives"
        },
        "materialBalance_vs_pieceActivity": {
            "diagnosis": "L'adversaire a des pièces actives mais vous avez l'avantage matériel",
            "prescription": "simplifiez la position"
        },
        "materialBalance_vs_kingSafety": {
            "diagnosis": "L'adversaire a un roi sûr mais vous avez plus de matériel",
            "prescription": "forcez les échanges"
        },
        "materialBalance_vs_pawnStructure": {
            "diagnosis": "L'adversaire a une meilleure structure mais vous avez l'avantage matériel",
            "prescription": "créez des complications tactiques"
        },

        // Mon contrôle d'espace vs leurs avantages
        "spaceControl_vs_materialBalance": {
            "diagnosis": "Vous contrôlez l'espace mais l'adversaire a plus de matériel",
            "prescription": "utilisez votre mobilité pour créer des menaces"
        },
        "spaceControl_vs_pieceActivity": {
            "diagnosis": "Vous contrôlez l'espace mais leurs pièces sont actives",
            "prescription": "limitez leurs pièces tout en activant les vôtres"
        },
        "spaceControl_vs_kingSafety": {
            "diagnosis": "Vous avez l'espace mais leur roi est sûr",
            "prescription": "préparez une attaque méthodique"
        },
        "spaceControl_vs_pawnStructure": {
            "diagnosis": "Vous contrôlez l'espace mais leur structure est meilleure",
            "prescription": "avancez vos pions pour créer des faiblesses"
        },

        // Mon activité vs leurs avantages
        "pieceActivity_vs_materialBalance": {
            "diagnosis": "Vos pièces sont actives mais l'adversaire a plus de matériel",
            "prescription": "cherchez des tactiques avant qu'il simplifie"
        },
        "pieceActivity_vs_spaceControl": {
            "diagnosis": "Vos pièces sont actives mais l'adversaire contrôle l'espace",
            "prescription": "créez des ruptures pour libérer vos pièces"
        },
        "pieceActivity_vs_kingSafety": {
            "diagnosis": "Vos pièces sont actives mais leur roi est sûr",
            "prescription": "préparez une attaque coordonnée"
        },
        "pieceActivity_vs_pawnStructure": {
            "diagnosis": "Vos pièces sont actives mais leur structure est meilleure",
            "prescription": "exploitez les faiblesses temporaires"
        },

        // Ma sécurité royale vs leurs avantages
        "kingSafety_vs_materialBalance": {
            "diagnosis": "Votre roi est sûr mais l'adversaire a plus de matériel",
            "prescription": "créez un jeu de contre-attaque"
        },
        "kingSafety_vs_spaceControl": {
            "diagnosis": "Votre roi est sûr mais l'adversaire contrôle l'espace",
            "prescription": "défendez patiemment et contre-attaquez"
        },
        "kingSafety_vs_pieceActivity": {
            "diagnosis": "Votre roi est sûr mais leurs pièces sont actives",
            "prescription": "neutralisez leurs menaces puis prenez l'initiative"
        },
        "kingSafety_vs_pawnStructure": {
            "diagnosis": "Votre roi est sûr mais leur structure est meilleure",
            "prescription": "jouez activement avant que leur avantage se concrétise"
        },

        // Ma structure vs leurs avantages
        "pawnStructure_vs_materialBalance": {
            "diagnosis": "Votre structure est meilleure mais l'adversaire a plus de matériel",
            "prescription": "créez un pion passé rapidement"
        },
        "pawnStructure_vs_spaceControl": {
            "diagnosis": "Votre structure est meilleure mais l'adversaire contrôle l'espace",
            "prescription": "consolidez puis contre-attaquez"
        },
        "pawnStructure_vs_pieceActivity": {
            "diagnosis": "Votre structure est meilleure mais leurs pièces sont actives",
            "prescription": "défendez puis exploitez vos pions"
        },
        "pawnStructure_vs_kingSafety": {
            "diagnosis": "Votre structure est meilleure mais leur roi est sûr",
            "prescription": "préparez un plan à long terme"
        },

        // === 2 vs 1 : MES 2 AVANTAGES vs LEUR 1 AVANTAGE ===

        // Mes 2 avantages vs leur 1 avantage
        "materialBalance_spaceControl_vs_pieceActivity": {
            "diagnosis": "Vous avez l'avantage matériel et contrôlez l'espace contre leur activité",
            "prescription": "consolidez puis pressez"
        },
        "materialBalance_spaceControl_vs_kingSafety": {
            "diagnosis": "Vous avez l'avantage matériel et contrôlez l'espace contre leur roi sûr",
            "prescription": "avancez méthodiquement"
        },
        "materialBalance_spaceControl_vs_pawnStructure": {
            "diagnosis": "Vous avez l'avantage matériel et contrôlez l'espace contre leur structure",
            "prescription": "créez des pions passés"
        },
        "materialBalance_pieceActivity_vs_spaceControl": {
            "diagnosis": "Vous avez l'avantage matériel et des pièces actives contre leur espace",
            "prescription": "brisez leurs lignes"
        },
        "materialBalance_pieceActivity_vs_kingSafety": {
            "diagnosis": "Vous avez l'avantage matériel et des pièces actives contre leur roi sûr",
            "prescription": "attaquez avec précision"
        },
        "materialBalance_pieceActivity_vs_pawnStructure": {
            "diagnosis": "Vous avez l'avantage matériel et des pièces actives contre leur structure",
            "prescription": "exploitez les faiblesses tactiques"
        },
        "materialBalance_kingSafety_vs_spaceControl": {
            "diagnosis": "Vous avez l'avantage matériel et un roi sûr contre leur espace",
            "prescription": "simplifiez vers une finale gagnante"
        },
        "materialBalance_kingSafety_vs_pieceActivity": {
            "diagnosis": "Vous avez l'avantage matériel et un roi sûr contre leur activité",
            "prescription": "neutralisez puis exploitez"
        },
        "materialBalance_kingSafety_vs_pawnStructure": {
            "diagnosis": "Vous avez l'avantage matériel et un roi sûr contre leur structure",
            "prescription": "poussez vos pions passés"
        },
        "materialBalance_pawnStructure_vs_spaceControl": {
            "diagnosis": "Vous avez l'avantage matériel et une meilleure structure contre leur espace",
            "prescription": "créez un pion passé lointain"
        },
        "materialBalance_pawnStructure_vs_pieceActivity": {
            "diagnosis": "Vous avez l'avantage matériel et une meilleure structure contre leur activité",
            "prescription": "consolidez puis avancez"
        },
        "materialBalance_pawnStructure_vs_kingSafety": {
            "diagnosis": "Vous avez l'avantage matériel et une meilleure structure contre leur roi sûr",
            "prescription": "préparez une finale technique"
        },

        "spaceControl_pieceActivity_vs_materialBalance": {
            "diagnosis": "Vous contrôlez l'espace et avez des pièces actives contre leur avantage matériel",
            "prescription": "attaquez avant qu'ils simplifient"
        },
        "spaceControl_pieceActivity_vs_kingSafety": {
            "diagnosis": "Vous contrôlez l'espace et avez des pièces actives contre leur roi sûr",
            "prescription": "préparez une attaque coordonnée"
        },
        "spaceControl_pieceActivity_vs_pawnStructure": {
            "diagnosis": "Vous contrôlez l'espace et avez des pièces actives contre leur structure",
            "prescription": "créez des ruptures"
        },
        "spaceControl_kingSafety_vs_materialBalance": {
            "diagnosis": "Vous contrôlez l'espace et avez un roi sûr contre leur avantage matériel",
            "prescription": "jouez positionellement"
        },
        "spaceControl_kingSafety_vs_pieceActivity": {
            "diagnosis": "Vous contrôlez l'espace et avez un roi sûr contre leur activité",
            "prescription": "contrôlez puis contre-attaquez"
        },
        "spaceControl_kingSafety_vs_pawnStructure": {
            "diagnosis": "Vous contrôlez l'espace et avez un roi sûr contre leur structure",
            "prescription": "avancez vos pions méthodiquement"
        },
        "spaceControl_pawnStructure_vs_materialBalance": {
            "diagnosis": "Vous contrôlez l'espace et avez une meilleure structure contre leur avantage matériel",
            "prescription": "créez des pions passés"
        },
        "spaceControl_pawnStructure_vs_pieceActivity": {
            "diagnosis": "Vous contrôlez l'espace et avez une meilleure structure contre leur activité",
            "prescription": "consolidez votre position"
        },
        "spaceControl_pawnStructure_vs_kingSafety": {
            "diagnosis": "Vous contrôlez l'espace et avez une meilleure structure contre leur roi sûr",
            "prescription": "préparez une poussée de pions"
        },

        "pieceActivity_kingSafety_vs_materialBalance": {
            "diagnosis": "Vous avez des pièces actives et un roi sûr contre leur avantage matériel",
            "prescription": "attaquez rapidement"
        },
        "pieceActivity_kingSafety_vs_spaceControl": {
            "diagnosis": "Vous avez des pièces actives et un roi sûr contre leur espace",
            "prescription": "brisez leurs lignes"
        },
        "pieceActivity_kingSafety_vs_pawnStructure": {
            "diagnosis": "Vous avez des pièces actives et un roi sûr contre leur structure",
            "prescription": "exploitez les faiblesses"
        },
        "pieceActivity_pawnStructure_vs_materialBalance": {
            "diagnosis": "Vous avez des pièces actives et une meilleure structure contre leur avantage matériel",
            "prescription": "créez des menaces tactiques"
        },
        "pieceActivity_pawnStructure_vs_spaceControl": {
            "diagnosis": "Vous avez des pièces actives et une meilleure structure contre leur espace",
            "prescription": "activez vos pions"
        },
        "pieceActivity_pawnStructure_vs_kingSafety": {
            "diagnosis": "Vous avez des pièces actives et une meilleure structure contre leur roi sûr",
            "prescription": "coordonnez pièces et pions"
        },

        "kingSafety_pawnStructure_vs_materialBalance": {
            "diagnosis": "Vous avez un roi sûr et une meilleure structure contre leur avantage matériel",
            "prescription": "jouez patiemment"
        },
        "kingSafety_pawnStructure_vs_spaceControl": {
            "diagnosis": "Vous avez un roi sûr et une meilleure structure contre leur espace",
            "prescription": "défendez puis contre-attaquez"
        },
        "kingSafety_pawnStructure_vs_pieceActivity": {
            "diagnosis": "Vous avez un roi sûr et une meilleure structure contre leur activité",
            "prescription": "neutralisez puis exploitez"
        },

        // === 1 vs 2 : MON 1 AVANTAGE vs LEURS 2 AVANTAGES ===

        // Mon avantage matériel vs leurs 2 avantages
        "materialBalance_vs_spaceControl_pieceActivity": {
            "diagnosis": "Vous avez un avantage statique contre leur pression dynamique",
            "prescription": "simplifiez immédiatement"
        },
        "materialBalance_vs_spaceControl_kingSafety": {
            "diagnosis": "Vous avez l'avantage matériel contre leur contrôle d'espace",
            "prescription": "réduisez leur mobilité par des échanges ciblés"
        },
        "materialBalance_vs_spaceControl_pawnStructure": {
            "diagnosis": "Vous avez l'avantage matériel contre leur contrôle d'espace",
            "prescription": "brisez leur contrôle spatial par des complications"
        },
        "materialBalance_vs_pieceActivity_kingSafety": {
            "diagnosis": "Vous avez l'avantage matériel contre leur activité",
            "prescription": "échangez leurs pièces actives pour neutraliser leur jeu"
        },
        "materialBalance_vs_pieceActivity_pawnStructure": {
            "diagnosis": "Vous avez l'avantage matériel contre leur activité",
            "prescription": "simplifiez pour éliminer leur compensation temporaire"
        },
        "materialBalance_vs_kingSafety_pawnStructure": {
            "diagnosis": "Vous avez l'avantage matériel contre leur solidité défensive",
            "prescription": "créez des complications tactiques"
        },

        // Mon espace vs leurs 2 avantages
        "spaceControl_vs_materialBalance_pieceActivity": {
            "diagnosis": "Vous contrôlez l'espace contre leur avantage matériel",
            "prescription": "exploitez votre mobilité avant qu'ils échangent"
        },
        "spaceControl_vs_materialBalance_kingSafety": {
            "diagnosis": "Vous contrôlez l'espace contre leur avantage matériel",
            "prescription": "attaquez maintenant avant leur consolidation"
        },
        "spaceControl_vs_materialBalance_pawnStructure": {
            "diagnosis": "Vous contrôlez l'espace contre leur avantage matériel",
            "prescription": "forcez des ruptures avant qu'ils simplifient"
        },
        "spaceControl_vs_pieceActivity_kingSafety": {
            "diagnosis": "Vous avez l'espace contre leurs pièces actives et leur roi sûr",
            "prescription": "limitez leurs pièces puis pressez"
        },
        "spaceControl_vs_pieceActivity_pawnStructure": {
            "diagnosis": "Vous avez l'espace contre leurs pièces actives et leur structure",
            "prescription": "avancez vos pions pour gêner"
        },
        "spaceControl_vs_kingSafety_pawnStructure": {
            "diagnosis": "Vous avez l'espace contre leur roi sûr et leur structure",
            "prescription": "préparez une attaque méthodique"
        },

        // Mon activité vs leurs 2 avantages
        "pieceActivity_vs_materialBalance_spaceControl": {
            "diagnosis": "Vos pièces sont actives contre leur avantage matériel",
            "prescription": "convertissez votre activité en gain matériel concret"
        },
        "pieceActivity_vs_materialBalance_kingSafety": {
            "diagnosis": "Vos pièces sont actives contre leur avantage matériel",
            "prescription": "forcez des gains tactiques avant qu'ils neutralisent vos pièces"
        },
        "pieceActivity_vs_materialBalance_pawnStructure": {
            "diagnosis": "Vos pièces sont actives contre leur avantage matériel",
            "prescription": "exploitez vos pièces pour réduire leur supériorité matérielle"
        },
        "pieceActivity_vs_spaceControl_kingSafety": {
            "diagnosis": "Vous avez l'activité contre leur espace et leur roi sûr",
            "prescription": "créez des ruptures pour vos pièces"
        },
        "pieceActivity_vs_spaceControl_pawnStructure": {
            "diagnosis": "Vous avez l'activité contre leur espace et leur structure",
            "prescription": "cherchez des tactiques immédiates"
        },
        "pieceActivity_vs_kingSafety_pawnStructure": {
            "diagnosis": "Vous avez l'activité contre leur roi sûr et leur structure",
            "prescription": "coordonnez une attaque puissante"
        },

        // Ma sécurité vs leurs 2 avantages
        "kingSafety_vs_materialBalance_spaceControl": {
            "diagnosis": "Vous avez le roi sûr contre leur avantage matériel et leur espace",
            "prescription": "défendez puis contre-attaquez"
        },
        "kingSafety_vs_materialBalance_pieceActivity": {
            "diagnosis": "Vous avez le roi sûr contre leur avantage matériel et leurs pièces actives",
            "prescription": "neutralisez leurs menaces"
        },
        "kingSafety_vs_materialBalance_pawnStructure": {
            "diagnosis": "Vous avez le roi sûr contre leur avantage matériel et leur structure",
            "prescription": "créez des contre-chances"
        },
        "kingSafety_vs_spaceControl_pieceActivity": {
            "diagnosis": "Vous avez un avantage statique contre leur pression dynamique",
            "prescription": "défendez fermement puis exploitez leurs faiblesses"
        },
        "kingSafety_vs_spaceControl_pawnStructure": {
            "diagnosis": "Vous avez le roi sûr contre leur espace et leur structure",
            "prescription": "patience et contre-jeu"
        },
        "kingSafety_vs_pieceActivity_pawnStructure": {
            "diagnosis": "Vous avez le roi sûr contre leurs pièces actives et leur structure",
            "prescription": "neutralisez puis exploitez"
        },

        // Ma structure vs leurs 2 avantages
        "pawnStructure_vs_materialBalance_spaceControl": {
            "diagnosis": "Vous avez la structure contre leur avantage matériel et leur espace",
            "prescription": "créez un pion passé rapidement"
        },
        "pawnStructure_vs_materialBalance_pieceActivity": {
            "diagnosis": "Vous avez la structure contre leur avantage matériel et leurs pièces actives",
            "prescription": "consolidez puis avancez vos pions"
        },
        "pawnStructure_vs_materialBalance_kingSafety": {
            "diagnosis": "Vous avez la structure contre leur avantage matériel et leur roi sûr",
            "prescription": "patience et plan à long terme"
        },
        "pawnStructure_vs_spaceControl_pieceActivity": {
            "diagnosis": "Vous avez un avantage statique contre leur pression dynamique",
            "prescription": "défendez puis exploitez vos pions"
        },
        "pawnStructure_vs_spaceControl_kingSafety": {
            "diagnosis": "Vous avez la structure contre leur espace et leur roi sûr",
            "prescription": "préparez une poussée de pions"
        },
        "pawnStructure_vs_pieceActivity_kingSafety": {
            "diagnosis": "Vous avez la structure contre leurs pièces actives et leur roi sûr",
            "prescription": "consolidez puis créez un pion passé"
        },

        // === 2 vs 2 : MES 2 AVANTAGES vs LEURS 2 AVANTAGES ===
        "materialBalance_spaceControl_vs_pieceActivity_kingSafety": {
            "diagnosis": "Vous avez l'avantage matériel et contrôlez l'espace contre leurs pièces actives et leur roi sûr",
            "prescription": "jouez méthodiquement"
        },
        "materialBalance_spaceControl_vs_pieceActivity_pawnStructure": {
            "diagnosis": "Vous avez l'avantage matériel et contrôlez l'espace contre leurs pièces actives et leur structure",
            "prescription": "pressez vos avantages"
        },
        "materialBalance_spaceControl_vs_kingSafety_pawnStructure": {
            "diagnosis": "Vous avez l'avantage matériel et contrôlez l'espace contre leur roi sûr et leur structure",
            "prescription": "créez des pions passés"
        },
        "materialBalance_pieceActivity_vs_spaceControl_kingSafety": {
            "diagnosis": "Vous avez l'avantage matériel et des pièces actives contre leur espace et leur roi sûr",
            "prescription": "attaquez avec précision"
        },
        "materialBalance_pieceActivity_vs_spaceControl_pawnStructure": {
            "diagnosis": "Vous avez l'avantage matériel et des pièces actives contre leur espace et leur structure",
            "prescription": "brisez leurs lignes"
        },
        "materialBalance_pieceActivity_vs_kingSafety_pawnStructure": {
            "diagnosis": "Vous avez l'avantage matériel et des pièces actives contre leur roi sûr et leur structure",
            "prescription": "coordonnez l'attaque"
        },
        "materialBalance_kingSafety_vs_spaceControl_pieceActivity": {
            "diagnosis": "Vous avez un avantage statique contre leur pression dynamique",
            "prescription": "patientez, neutralisez leur activité puis exploitez votre solidité"
        },
        "materialBalance_kingSafety_vs_spaceControl_pawnStructure": {
            "diagnosis": "Vous avez l'avantage matériel et un roi sûr contre leur espace et leur structure",
            "prescription": "simplifiez vers une finale"
        },
        "materialBalance_kingSafety_vs_pieceActivity_pawnStructure": {
            "diagnosis": "Vous avez l'avantage matériel et un roi sûr contre leurs pièces actives et leur structure",
            "prescription": "défendez puis pressez"
        },
        "materialBalance_pawnStructure_vs_spaceControl_pieceActivity": {
            "diagnosis": "Vous avez un avantage statique contre leur pression dynamique",
            "prescription": "résistez à leur pression temporaire puis imposez vos avantages durables"
        },
        "materialBalance_pawnStructure_vs_spaceControl_kingSafety": {
            "diagnosis": "Vous avez l'avantage matériel et une meilleure structure contre leur espace et leur roi sûr",
            "prescription": "créez un pion passé lointain"
        },
        "materialBalance_pawnStructure_vs_pieceActivity_kingSafety": {
            "diagnosis": "Vous avez l'avantage matériel et une meilleure structure contre leurs pièces actives et leur roi sûr",
            "prescription": "jouez techniquement"
        },
        "spaceControl_pieceActivity_vs_materialBalance_kingSafety": {
            "diagnosis": "Vous avez un avantage dynamique contre leur avantage matériel",
            "prescription": "agissez rapidement avant qu'ils simplifient"
        },
        "spaceControl_pieceActivity_vs_materialBalance_pawnStructure": {
            "diagnosis": "Vous avez un avantage dynamique contre leur avantage matériel",
            "prescription": "forcez les complications maintenant ou jamais"
        },
        "spaceControl_pieceActivity_vs_kingSafety_pawnStructure": {
            "diagnosis": "Vous avez un avantage dynamique contre leur solidité statique",
            "prescription": "attaquez maintenant, votre fenêtre d'action est limitée"
        },
        "spaceControl_kingSafety_vs_materialBalance_pieceActivity": {
            "diagnosis": "Vous contrôlez l'espace et avez un roi sûr contre leur avantage matériel et leurs pièces actives",
            "prescription": "contrôlez puis contre-attaquez"
        },
        "spaceControl_kingSafety_vs_materialBalance_pawnStructure": {
            "diagnosis": "Vous contrôlez l'espace et avez un roi sûr contre leur avantage matériel et leur structure",
            "prescription": "jouez positionellement"
        },
        "spaceControl_kingSafety_vs_pieceActivity_pawnStructure": {
            "diagnosis": "Vous contrôlez l'espace et avez un roi sûr contre leurs pièces actives et leur structure",
            "prescription": "limitez puis pressez"
        },
        "spaceControl_pawnStructure_vs_materialBalance_pieceActivity": {
            "diagnosis": "Vous contrôlez l'espace et avez une meilleure structure contre leur avantage matériel et leurs pièces actives",
            "prescription": "consolidez votre position"
        },
        "spaceControl_pawnStructure_vs_materialBalance_kingSafety": {
            "diagnosis": "Vous contrôlez l'espace et avez une meilleure structure contre leur avantage matériel et leur roi sûr",
            "prescription": "avancez vos pions"
        },
        "spaceControl_pawnStructure_vs_pieceActivity_kingSafety": {
            "diagnosis": "Vous contrôlez l'espace et avez une meilleure structure contre leurs pièces actives et leur roi sûr",
            "prescription": "préparez une poussée"
        },
        "pieceActivity_kingSafety_vs_materialBalance_spaceControl": {
            "diagnosis": "Vous avez des pièces actives et un roi sûr contre leur avantage matériel et leur espace",
            "prescription": "attaquez avec précision"
        },
        "pieceActivity_kingSafety_vs_materialBalance_pawnStructure": {
            "diagnosis": "Vous avez des pièces actives et un roi sûr contre leur avantage matériel et leur structure",
            "prescription": "exploitez les faiblesses"
        },
        "pieceActivity_kingSafety_vs_spaceControl_pawnStructure": {
            "diagnosis": "Vous avez des pièces actives et un roi sûr contre leur espace et leur structure",
            "prescription": "brisez leurs lignes"
        },
        "pieceActivity_pawnStructure_vs_materialBalance_spaceControl": {
            "diagnosis": "Vous avez des pièces actives et une meilleure structure contre leur avantage matériel et leur espace",
            "prescription": "créez des menaces tactiques"
        },
        "pieceActivity_pawnStructure_vs_materialBalance_kingSafety": {
            "diagnosis": "Vous avez des pièces actives et une meilleure structure contre leur avantage matériel et leur roi sûr",
            "prescription": "coordonnez pièces et pions"
        },
        "pieceActivity_pawnStructure_vs_spaceControl_kingSafety": {
            "diagnosis": "Vous avez des pièces actives et une meilleure structure contre leur espace et leur roi sûr",
            "prescription": "activez vos pions"
        },
        "kingSafety_pawnStructure_vs_materialBalance_spaceControl": {
            "diagnosis": "Vous avez un roi sûr et une meilleure structure contre leur avantage matériel et leur espace",
            "prescription": "patience et solidité"
        },
        "kingSafety_pawnStructure_vs_materialBalance_pieceActivity": {
            "diagnosis": "Vous avez un roi sûr et une meilleure structure contre leur avantage matériel et leurs pièces actives",
            "prescription": "défendez puis exploitez"
        },
        "kingSafety_pawnStructure_vs_spaceControl_pieceActivity": {
            "diagnosis": "Vous avez un avantage statique contre leur pression dynamique",
            "prescription": "défendez solidement, leur activité s'estompera"
        },

        // === MES AVANTAGES vs AUCUN AVANTAGE ADVERSE ===
        "materialBalance_vs_": {
            "diagnosis": "Vous avez un avantage matériel sans opposition",
            "prescription": "pressez méthodiquement vers une finale gagnante"
        },
        "spaceControl_vs_": {
            "diagnosis": "Vous dominez l'espace sans résistance",
            "prescription": "exploitez votre mobilité supérieure pour créer des faiblesses"
        },
        "pieceActivity_vs_": {
            "diagnosis": "Vos pièces sont nettement plus actives",
            "prescription": "convertissez cette activité en gains tangibles"
        },
        "kingSafety_vs_": {
            "diagnosis": "Votre roi est beaucoup mieux protégé",
            "prescription": "attaquez sans risque, votre position est solide"
        },
        "pawnStructure_vs_": {
            "diagnosis": "Votre structure de pions est nettement supérieure",
            "prescription": "avancez vos pions pour créer des faiblesses durables"
        },

        // === ÉGALITÉ TOTALE ===
        "_vs_": {
            "diagnosis": "Position parfaitement équilibrée",
            "prescription": "jouez pour de petites améliorations et restez patient"
        },

        // === MES MULTIPLES AVANTAGES vs AUCUN AVANTAGE ADVERSE ===

        // Mes 2 avantages vs rien
        "materialBalance_spaceControl_vs_": {
            "diagnosis": "Vous dominez avec l'avantage matériel et le contrôle de l'espace",
            "prescription": "convertissez méthodiquement vers une victoire technique"
        },
        "materialBalance_pieceActivity_vs_": {
            "diagnosis": "Vous avez l'avantage matériel et des pièces plus actives",
            "prescription": "pressez sur tous les fronts pour une victoire rapide"
        },
        "materialBalance_kingSafety_vs_": {
            "diagnosis": "Vous avez l'avantage matériel et un roi sûr",
            "prescription": "simplifiez vers une finale gagnante en toute sécurité"
        },
        "materialBalance_pawnStructure_vs_": {
            "diagnosis": "Vous dominez avec l'avantage matériel et une meilleure structure",
            "prescription": "créez des pions passés pour accélérer la victoire"
        },
        "spaceControl_pieceActivity_vs_": {
            "diagnosis": "Vous contrôlez l'espace avec des pièces actives",
            "prescription": "étouffez l'adversaire et cherchez la décision tactique"
        },
        "spaceControl_kingSafety_vs_": {
            "diagnosis": "Vous avez le contrôle de l'espace et un roi sûr",
            "prescription": "avancez méthodiquement sans prendre de risques"
        },
        "spaceControl_pawnStructure_vs_": {
            "diagnosis": "Vous dominez avec le contrôle de l'espace et une meilleure structure",
            "prescription": "poussez vos pions pour créer des faiblesses décisives"
        },
        "pieceActivity_kingSafety_vs_": {
            "diagnosis": "Vous avez des pièces actives et un roi sûr",
            "prescription": "attaquez sans retenue, votre position est idéale"
        },
        "pieceActivity_pawnStructure_vs_": {
            "diagnosis": "Vous avez des pièces actives et une structure supérieure",
            "prescription": "combinez pression immédiate et plan à long terme"
        },
        "kingSafety_pawnStructure_vs_": {
            "diagnosis": "Vous avez un roi sûr et une structure supérieure",
            "prescription": "jouez positionellement pour augmenter votre avantage"
        },

        // Mes 3 avantages vs rien
        "materialBalance_spaceControl_pieceActivity_vs_": {
            "diagnosis": "Domination totale : matériel, espace et activité",
            "prescription": "la victoire est acquise, jouez avec précision"
        },
        "materialBalance_spaceControl_kingSafety_vs_": {
            "diagnosis": "Position écrasante : matériel, espace et roi sûr",
            "prescription": "avancez méthodiquement vers une victoire certaine"
        },
        "materialBalance_spaceControl_pawnStructure_vs_": {
            "diagnosis": "Domination stratégique : matériel, espace et structure",
            "prescription": "créez des pions passés lointains pour verrouiller la victoire"
        },
        "materialBalance_pieceActivity_kingSafety_vs_": {
            "diagnosis": "Avantage décisif : matériel, activité et roi sûr",
            "prescription": "attaquez massivement, l'adversaire est sans défense"
        },
        "materialBalance_pieceActivity_pawnStructure_vs_": {
            "diagnosis": "Domination technique : matériel, activité et structure",
            "prescription": "combinez pression tactique et avantage positionnel"
        },
        "materialBalance_kingSafety_pawnStructure_vs_": {
            "diagnosis": "Avantage solide : matériel, roi sûr et structure",
            "prescription": "jouez techniquement pour convertir votre supériorité"
        },
        "spaceControl_pieceActivity_kingSafety_vs_": {
            "diagnosis": "Domination complète : espace, activité et roi sûr",
            "prescription": "étouffez l'adversaire puis donnez le coup de grâce"
        },
        "spaceControl_pieceActivity_pawnStructure_vs_": {
            "diagnosis": "Pression totale : espace, activité et structure",
            "prescription": "avancez vos pions soutenus par vos pièces actives"
        },
        "spaceControl_kingSafety_pawnStructure_vs_": {
            "diagnosis": "Domination positionnelle : espace, roi sûr et structure",
            "prescription": "exploitez méthodiquement vos multiples avantages"
        },
        "pieceActivity_kingSafety_pawnStructure_vs_": {
            "diagnosis": "Supériorité tactique : activité, roi sûr et structure",
            "prescription": "activez vos pièces pour soutenir l'avance de vos pions"
        },

        // Mes 4 avantages vs rien (domination absolue)
        "materialBalance_spaceControl_pieceActivity_kingSafety_vs_": {
            "diagnosis": "Domination absolue sur tous les plans",
            "prescription": "la partie est virtuellement gagnée, ne gâchez pas"
        },
        "materialBalance_spaceControl_pieceActivity_pawnStructure_vs_": {
            "diagnosis": "Écrasement total : tous les avantages sauf sécurité",
            "prescription": "forcez une conclusion rapide avant toute complication"
        },
        "materialBalance_spaceControl_kingSafety_pawnStructure_vs_": {
            "diagnosis": "Domination stratégique complète",
            "prescription": "avancez méthodiquement vos pions passés soutenus"
        },
        "materialBalance_pieceActivity_kingSafety_pawnStructure_vs_": {
            "diagnosis": "Supériorité écrasante sur tous les fronts",
            "prescription": "coordonnez l'attaque finale avec vos multiples avantages"
        },
        "spaceControl_pieceActivity_kingSafety_pawnStructure_vs_": {
            "diagnosis": "Domination tactique et positionnelle absolue",
            "prescription": "étouffez progressivement toute résistance adverse"
        },

        // Mes 5 avantages vs rien (domination totale)
        "materialBalance_spaceControl_pieceActivity_kingSafety_pawnStructure_vs_": {
            "diagnosis": "Domination absolue : tous les avantages vous appartiennent",
            "prescription": "victoire acquise, jouez avec précision pour conclure"
        }
    }
}; 