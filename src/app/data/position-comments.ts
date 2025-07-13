import { PositionComments } from './position-comments-base';
import { DEFENSIVE_SITUATIONS } from './position-comments-defensive';
import { BALANCED_SITUATIONS } from './position-comments-balanced';
import { ADVANTAGEOUS_SITUATIONS } from './position-comments-advantageous';
import { DOMINANT_SITUATIONS } from './position-comments-dominant';

export const POSITION_COMMENTS: PositionComments = {
    "situations": {
        ...DEFENSIVE_SITUATIONS,
        ...BALANCED_SITUATIONS,
        ...ADVANTAGEOUS_SITUATIONS,
        ...DOMINANT_SITUATIONS
    }
};

// Réexporter les interfaces pour compatibilité
export type { PositionAdvice, PositionComments } from './position-comments-base'; 