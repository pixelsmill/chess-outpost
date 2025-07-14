export interface PositionAdvice {
    diagnosis: string;    // Description de la situation stratégique
    prescription: string; // Action recommandée
    direction: string;    // Direction de la boussole stratégique (attack, activation, imbalance, reorganization, defense, blocking, simplification, pressure, init)
}

// Table de correspondance direction -> Material Icons de la boussole
export const DIRECTION_ICONS: { [key: string]: string } = {
    'attack': 'gps_fixed',        // North - Attaque du roi
    'activation': 'vpn_key',      // Northeast - Activer les pièces
    'imbalance': 'flash_on',      // East - Créer du déséquilibre
    'reorganization': 'auto_mode', // Southeast - Réorganiser/préparer plan
    'defense': 'shield',          // South - Consolidation/Défense
    'blocking': 'lock',           // Southwest - Fermer/Neutraliser
    'simplification': 'hourglass_empty', // West - Simplification/Transition finale
    'pressure': 'compress',       // Northwest - Maintenir pression/exploiter faiblesse
    'init': 'circle'                // Center - Position initiale
};

// Table de correspondance direction -> Couleurs HSL (cercle chromatique)
export const DIRECTION_COLORS: { [key: string]: string } = {
    'attack': 'hsla(0, 100%, 50%, 0.9)',        // North - Rouge (0°)
    'activation': 'hsla(45, 100%, 50%, 0.9)',   // Northeast - Orange (45°)
    'imbalance': 'hsla(90, 100%, 50%, 0.9)',    // East - Jaune (90°)
    'reorganization': 'hsla(135, 100%, 50%, 0.9)', // Southeast - Vert-Jaune (135°)
    'defense': 'hsla(180, 100%, 50%, 0.9)',     // South - Cyan (180°)
    'blocking': 'hsla(225, 100%, 50%, 0.9)',    // Southwest - Bleu-Cyan (225°)
    'simplification': 'hsla(270, 100%, 50%, 0.9)', // West - Bleu (270°)
    'pressure': 'hsla(315, 100%, 50%, 0.9)',    // Northwest - Magenta (315°)
    'init': 'hsla(0, 0%, 60%, 0.9)'             // Center - Gris neutre
};



// Fonction utilitaire pour obtenir l'icône d'une direction
export function getDirectionIcon(direction: string): string {
    return DIRECTION_ICONS[direction] || 'help_outline';
}

// Fonction utilitaire pour obtenir la couleur d'une direction
export function getDirectionColor(direction: string): string {
    return DIRECTION_COLORS[direction] || 'rgba(128, 128, 128, 0.9)';
}

// Fonction utilitaire pour obtenir toutes les directions disponibles
export function getAvailableDirections(): string[] {
    return Object.keys(DIRECTION_ICONS);
}

export interface PositionComments {
    // Format: "mesAvantages_vs_leursAvantages"
    situations: {
        [key: string]: PositionAdvice;
    };
} 