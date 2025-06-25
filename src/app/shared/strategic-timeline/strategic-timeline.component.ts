import { Component, input, output, inject, OnInit, ViewChild, ElementRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameAnalysisCacheService, CachedMoveAnalysis } from '../../services/game-analysis-cache.service';
import { PositionAdviceService } from '../../services/position-advice.service';

interface TimelineSegment {
    startMove: number;
    endMove: number;
    adviceKey: string;
    advantageColor: 'white' | 'black' | 'neutral';
    strength: number; // 0-100, force de l'avantage moyen
    description: string;
    whiteAdvantages: string;
    blackAdvantages: string;
    whiteAdvice: string;
    blackAdvice: string;
}

interface TimelineEvent {
    move: number;
    type: 'key_change' | 'advantage_shift';
    description: string;
    significance: number; // 1-5
}

@Component({
    selector: 'app-strategic-timeline',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './strategic-timeline.component.html',
    styleUrl: './strategic-timeline.component.scss'
})
export class StrategicTimelineComponent implements OnInit {
    @ViewChild('timeline', { static: false }) timelineElement!: ElementRef<HTMLElement>;

    // Inputs
    gameHistory = input<string[]>([]);
    currentMoveIndex = input<number>(0);
    maxMoves = input<number>(50);

    // Outputs
    moveSelected = output<number>();

    // Services
    private gameAnalysisCache = inject(GameAnalysisCacheService);
    private positionAdvice = inject(PositionAdviceService);

    // Data
    segments: TimelineSegment[] = [];
    events: TimelineEvent[] = [];

    // UI State
    hoveredMove: number | null = null;
    tooltipPosition = { x: 0, y: 0 };
    tooltipVisible = false;

    constructor() {
        console.log('🚀 Timeline: Initialisation');

        // Watcher pour relancer l'analyse quand l'historique change
        effect(() => {
            const history = this.gameHistory();
            if (history.length > 0) {
                console.log('📈 Timeline: Historique modifié, relance de l\'analyse...', history.length);
                this.analyzeFromCache();
            }
        });

        // Watcher pour surveiller les changements de position actuelle
        effect(() => {
            const currentMove = this.currentMoveIndex();
            const maxMoves = this.maxMoves();
            console.log(`📍 Timeline: Position actuelle ${currentMove}/${maxMoves}`);
        });
    }

    ngOnInit() {
        this.analyzeFromCache();
    }

    /**
     * Analyse basée exclusivement sur le cache
     * Groupe les positions par clé de conseil identique
     */
    private analyzeFromCache() {
        const history = this.gameHistory();
        if (history.length === 0) {
            console.log('⚠️ Timeline: Pas d\'historique disponible');
            return;
        }

        console.log('🔍 Timeline: Analyse depuis le cache pour', history.length, 'positions');

        // Récupérer toutes les analyses en cache
        const cachedAnalyses: (CachedMoveAnalysis | null)[] = [];
        for (let i = 0; i < history.length; i++) {
            const analysis = this.gameAnalysisCache.getMoveAnalysis(i);
            cachedAnalyses.push(analysis);

            // Debug pour les premières positions
            if (i < 3) {
                console.log(`📦 Timeline Debug - Position ${i}:`, analysis ? 'Trouvée' : 'Manquante', analysis);
            }
        }

        // Vérifier si on a tout en cache
        const missingCache = cachedAnalyses.some(analysis => analysis === null);
        const availableCount = cachedAnalyses.filter(a => a !== null).length;

        console.log(`📊 Timeline Cache Status: ${availableCount}/${history.length} analyses disponibles`);

        // Debug détaillé du cache
        if (availableCount > 0) {
            console.log('🔍 Timeline: Échantillon du cache:');
            for (let i = 0; i < Math.min(3, availableCount); i++) {
                const analysis = cachedAnalyses[i];
                if (analysis) {
                    console.log(`  Position ${i}: WhiteAdv="${analysis.whiteAdvantages}", BlackAdv="${analysis.blackAdvantages}"`);
                }
            }
        }

        if (missingCache) {
            console.log('⚠️ Timeline: Cache incomplet, essai avec les analyses disponibles...');

            // Essayer avec les analyses disponibles seulement
            const validAnalyses = cachedAnalyses.filter((analysis): analysis is CachedMoveAnalysis => analysis !== null);
            if (validAnalyses.length > 0) {
                console.log(`🔄 Timeline: Génération avec ${validAnalyses.length} analyses partielles`);
                this.segments = this.generateSegmentsFromCache(validAnalyses);
                this.events = this.generateEventsFromSegments(this.segments);
                console.log('📊 Timeline générée (partielle):', this.segments.length, 'segments,', this.events.length, 'événements');
                return;
            } else {
                console.log('❌ Timeline: Aucune analyse disponible');
                this.generateEmptyState();
                return;
            }
        }

        console.log('✅ Timeline: Cache complet disponible');

        // Générer les segments basés sur les clés de conseil
        this.segments = this.generateSegmentsFromCache(cachedAnalyses as CachedMoveAnalysis[]);
        this.events = this.generateEventsFromSegments(this.segments);

        console.log('📊 Timeline générée:', this.segments.length, 'segments,', this.events.length, 'événements');

        // Debug des premiers segments
        if (this.segments.length > 0) {
            console.log('🎯 Premier segment:', this.segments[0]);
        }
    }

    /**
     * Génère les segments en groupant les positions par clé de conseil identique
     */
    private generateSegmentsFromCache(cachedAnalyses: CachedMoveAnalysis[]): TimelineSegment[] {
        if (cachedAnalyses.length === 0) {
            console.log('⚠️ generateSegmentsFromCache: Aucune analyse fournie');
            return [];
        }

        console.log('🔍 generateSegmentsFromCache: Traitement de', cachedAnalyses.length, 'analyses');

        const segments: TimelineSegment[] = [];
        let currentSegment: TimelineSegment | null = null;

        for (let i = 0; i < cachedAnalyses.length; i++) {
            const analysis = cachedAnalyses[i];
            const adviceKey = this.getAdviceKeyFromAnalysis(analysis);

            // Debug pour les premières analyses
            if (i < 3) {
                console.log(`🔍 Analyse ${i}: Key="${adviceKey}", WhiteAdv="${analysis.whiteAdvantages}", BlackAdv="${analysis.blackAdvantages}"`);
            }

            // Si c'est le début ou si la clé change, créer un nouveau segment
            if (!currentSegment || currentSegment.adviceKey !== adviceKey) {
                // Terminer le segment précédent
                if (currentSegment) {
                    currentSegment.endMove = i - 1;
                    segments.push(currentSegment);
                    console.log(`✅ Segment terminé: ${currentSegment.startMove}-${currentSegment.endMove} (${currentSegment.adviceKey})`);
                }

                // Créer un nouveau segment
                currentSegment = {
                    startMove: i,
                    endMove: i, // sera mis à jour
                    adviceKey: adviceKey,
                    advantageColor: this.getAdvantageColorFromAnalysis(analysis),
                    strength: this.getStrengthFromAnalysis(analysis),
                    description: this.getDescriptionFromAnalysis(analysis),
                    whiteAdvantages: analysis.whiteAdvantages,
                    blackAdvantages: analysis.blackAdvantages,
                    whiteAdvice: analysis.whiteAdvice,
                    blackAdvice: analysis.blackAdvice
                };

                console.log(`🆕 Nouveau segment créé: ${i} (${adviceKey})`);
            }
        }

        // Terminer le dernier segment
        if (currentSegment) {
            currentSegment.endMove = cachedAnalyses.length - 1;
            segments.push(currentSegment);
            console.log(`✅ Dernier segment terminé: ${currentSegment.startMove}-${currentSegment.endMove} (${currentSegment.adviceKey})`);
        }

        console.log(`📊 Total segments générés: ${segments.length}`);
        return segments;
    }

    /**
     * Génère la clé de conseil à partir d'une analyse en cache
     * Utilise la même logique que dans analyze.component.ts
     */
    private getAdviceKeyFromAnalysis(analysis: CachedMoveAnalysis): string {
        const whiteAdvantages = analysis.whiteAdvantages.split(', ').filter(a => a.trim() !== '');
        const blackAdvantages = analysis.blackAdvantages.split(', ').filter(a => a.trim() !== '');

        const key = `${whiteAdvantages.join('_')}_vs_${blackAdvantages.join('_')}`;

        // Debug occasionnel
        if (Math.random() < 0.1) {
            console.log(`🔑 Key Debug: "${analysis.whiteAdvantages}" + "${analysis.blackAdvantages}" → "${key}"`);
        }

        return key;
    }

    /**
     * Détermine la couleur avantagée à partir de l'analyse
     */
    private getAdvantageColorFromAnalysis(analysis: CachedMoveAnalysis): 'white' | 'black' | 'neutral' {
        const evaluation = analysis.evaluation;
        const total = evaluation.materialBalance.percentage +
            evaluation.spaceControl.percentage +
            evaluation.pieceActivity.percentage +
            evaluation.kingSafety.percentage +
            evaluation.pawnStructure.percentage;

        if (total > 15) return 'white';
        if (total < -15) return 'black';
        return 'neutral';
    }

    /**
     * Calcule la force de l'avantage à partir de l'analyse
     */
    private getStrengthFromAnalysis(analysis: CachedMoveAnalysis): number {
        const evaluation = analysis.evaluation;
        const total = Math.abs(
            evaluation.materialBalance.percentage +
            evaluation.spaceControl.percentage +
            evaluation.pieceActivity.percentage +
            evaluation.kingSafety.percentage +
            evaluation.pawnStructure.percentage
        );

        return Math.min(100, total / 5);
    }

    /**
     * Génère une description à partir de l'analyse
     */
    private getDescriptionFromAnalysis(analysis: CachedMoveAnalysis): string {
        const whiteAdvantages = analysis.whiteAdvantages;
        const blackAdvantages = analysis.blackAdvantages;

        if (whiteAdvantages && blackAdvantages) {
            return `${whiteAdvantages} vs ${blackAdvantages}`;
        } else if (whiteAdvantages) {
            return `Blancs: ${whiteAdvantages}`;
        } else if (blackAdvantages) {
            return `Noirs: ${blackAdvantages}`;
        } else {
            return 'Position équilibrée';
        }
    }

    /**
     * Génère les événements basés sur les changements de segments
     */
    private generateEventsFromSegments(segments: TimelineSegment[]): TimelineEvent[] {
        const events: TimelineEvent[] = [];

        for (let i = 1; i < segments.length; i++) {
            const previousSegment = segments[i - 1];
            const currentSegment = segments[i];

            // Événement de changement de clé
            events.push({
                move: currentSegment.startMove,
                type: 'key_change',
                description: `Changement stratégique: ${currentSegment.description}`,
                significance: this.calculateSignificance(previousSegment, currentSegment)
            });

            // Événement de changement d'avantage si applicable
            if (previousSegment.advantageColor !== currentSegment.advantageColor) {
                events.push({
                    move: currentSegment.startMove,
                    type: 'advantage_shift',
                    description: `Initiative passe aux ${this.getColorName(currentSegment.advantageColor)}`,
                    significance: 4
                });
            }
        }

        return events;
    }

    /**
     * Calcule l'importance d'un changement de segment
     */
    private calculateSignificance(previousSegment: TimelineSegment, currentSegment: TimelineSegment): number {
        // Plus la différence de force est importante, plus c'est significatif
        const strengthDiff = Math.abs(currentSegment.strength - previousSegment.strength);

        if (strengthDiff > 40) return 5;
        if (strengthDiff > 25) return 4;
        if (strengthDiff > 15) return 3;
        if (strengthDiff > 5) return 2;
        return 1;
    }

    /**
     * Traduit une couleur en nom français
     */
    private getColorName(color: 'white' | 'black' | 'neutral'): string {
        switch (color) {
            case 'white': return 'Blancs';
            case 'black': return 'Noirs';
            case 'neutral': return 'Position équilibrée';
        }
    }

    /**
     * État vide quand le cache n'est pas disponible
     */
    private generateEmptyState() {
        this.segments = [];
        this.events = [];
        console.log('📝 Timeline: État vide généré (cache non disponible)');
    }

    // === MÉTHODES D'INTERACTION UTILISATEUR ===

    onTimelineClick(event: MouseEvent) {
        const rect = this.timelineElement.nativeElement.getBoundingClientRect();
        const clickPosition = (event.clientX - rect.left) / rect.width;
        const moveIndex = Math.floor(clickPosition * this.maxMoves());
        this.moveSelected.emit(moveIndex);
    }

    onTimelineHover(event: MouseEvent) {
        const rect = this.timelineElement.nativeElement.getBoundingClientRect();
        this.hoveredMove = Math.floor(((event.clientX - rect.left) / rect.width) * this.maxMoves());
        this.tooltipPosition = { x: event.clientX + 10, y: event.clientY - 10 };
        this.tooltipVisible = true;
    }

    onTimelineLeave() {
        this.hoveredMove = null;
        this.tooltipVisible = false;
    }

    // === MÉTHODES D'AFFICHAGE ===

    getSegmentWidth(segment: TimelineSegment): number {
        const totalMoves = this.maxMoves();
        return ((segment.endMove - segment.startMove + 1) / totalMoves) * 100;
    }

    getSegmentColor(segment: TimelineSegment): string {
        const baseColors = {
            'white': '#e8f4f8',    // Bleu clair pour les blancs
            'black': '#f8e8e8',    // Rouge clair pour les noirs
            'neutral': '#f0f0f0'   // Gris clair pour neutre
        };

        const strongColors = {
            'white': '#4a90a4',    // Bleu plus foncé
            'black': '#a44a4a',    // Rouge plus foncé
            'neutral': '#888888'   // Gris foncé
        };

        // Plus l'avantage est fort, plus la couleur est intense
        const intensity = segment.strength / 100;
        const baseColor = baseColors[segment.advantageColor];
        const strongColor = strongColors[segment.advantageColor];

        // Mélanger les couleurs selon l'intensité
        if (intensity < 0.3) {
            return baseColor;
        } else {
            // Transition progressive vers la couleur forte
            const factor = (intensity - 0.3) / 0.7; // Normaliser entre 0 et 1
            return this.blendColors(baseColor, strongColor, factor);
        }
    }

    /**
     * Mélange deux couleurs hex selon un facteur
     */
    private blendColors(color1: string, color2: string, factor: number): string {
        // Conversion hex vers RGB
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);

        if (!rgb1 || !rgb2) return color1;

        // Mélange
        const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * factor);
        const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * factor);
        const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * factor);

        // Reconversion vers hex
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    /**
     * Convertit une couleur hex en RGB
     */
    private hexToRgb(hex: string): { r: number, g: number, b: number } | null {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    getCurrentPosition(): number {
        const currentMove = this.currentMoveIndex();
        const maxMoves = this.maxMoves();
        return maxMoves > 0 ? (currentMove / maxMoves) * 100 : 0;
    }

    getHoveredSegment(): TimelineSegment | null {
        if (this.hoveredMove === null) return null;

        return this.segments.find(segment =>
            this.hoveredMove! >= segment.startMove && this.hoveredMove! <= segment.endMove
        ) || null;
    }

    getHoveredEvent(): TimelineEvent | null {
        if (this.hoveredMove === null) return null;

        // Tolérance de ±1 coup pour les événements
        return this.events.find(event =>
            Math.abs(event.move - this.hoveredMove!) <= 1
        ) || null;
    }

    // === MÉTHODES POUR LE BILAN DE LA PARTIE ===

    /**
     * Calcule la longueur moyenne des phases stratégiques
     */
    getAveragePhaseLength(): number {
        if (this.segments.length === 0) return 0;

        const totalLength = this.segments.reduce((sum, segment) =>
            sum + (segment.endMove - segment.startMove + 1), 0
        );

        return Math.round(totalLength / this.segments.length);
    }

    /**
     * Génère une description générale de la partie
     */
    getGameDescription(): string {
        if (this.segments.length === 0) {
            return 'Aucune analyse disponible';
        }

        // Compter les phases par couleur avantagée
        const colorCount = this.segments.reduce((count, segment) => {
            count[segment.advantageColor]++;
            return count;
        }, { white: 0, black: 0, neutral: 0 } as Record<'white' | 'black' | 'neutral', number>);

        // Déterminer le caractère général de la partie
        if (colorCount.neutral > this.segments.length * 0.6) {
            return 'Partie très équilibrée avec de nombreuses phases neutres';
        } else if (colorCount.white > colorCount.black * 1.5) {
            return 'Partie dominée par les Blancs';
        } else if (colorCount.black > colorCount.white * 1.5) {
            return 'Partie dominée par les Noirs';
        } else if (this.events.length > this.segments.length * 0.8) {
            return 'Partie très dynamique avec de nombreux retournements';
        } else if (this.segments.length > this.maxMoves() / 3) {
            return 'Partie tactique avec de fréquents changements stratégiques';
        } else {
            return 'Partie positionnelle avec des phases stratégiques longues';
        }
    }

} 