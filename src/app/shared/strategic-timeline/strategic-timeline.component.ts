import { Component, input, output, inject, OnInit, ViewChild, ElementRef, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdviceContentComponent } from '../advice-content/advice-content.component';
import { GameAnalysisCacheService, CachedMoveAnalysis } from '../../services/game-analysis-cache.service';
import { PositionAdviceService } from '../../services/position-advice.service';
import { BoardDisplayService } from '../../services/board-display.service';
import { getDirectionColor, getDirectionIcon } from '../../data/position-comments-base';

interface TimelineSegment {
    id: string; // Identifiant unique pour le tracking
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
    whiteDirection: string; // Direction stratégique pour les blancs
    blackDirection: string; // Direction stratégique pour les noirs
}



@Component({
    selector: 'app-strategic-timeline',
    standalone: true,
    imports: [CommonModule, AdviceContentComponent],
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
    private boardDisplay = inject(BoardDisplayService);
    private cdr = inject(ChangeDetectorRef);

    // Data
    segments: TimelineSegment[] = [];

    // UI State
    hoveredMove: number | null = null;
    tooltipPosition = { x: 0, y: 0 };
    tooltipVisible = false;

    constructor() {
        // Watcher pour relancer l'analyse quand l'historique change
        effect(() => {
            const history = this.gameHistory();
            if (history.length > 0) {
                this.analyzeFromCache();
            }
        });

        // Watcher pour surveiller les changements de position actuelle
        effect(() => {
            const currentMove = this.currentMoveIndex();
            const maxMoves = this.maxMoves();
        });

        // Watcher pour forcer le rafraîchissement quand l'orientation change
        effect(() => {
            const orientation = this.boardDisplay.boardOrientation();

            // Log d'un segment exemple si disponible
            if (this.segments.length > 0) {
                const exampleSegment = this.segments[0];
            }

            // Déclencher une détection de changement complète pour actualiser le tooltip
            this.cdr.detectChanges();
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
            return;
        }

        // Récupérer toutes les analyses en cache
        const cachedAnalyses: (CachedMoveAnalysis | null)[] = [];
        for (let i = 0; i < history.length; i++) {
            const analysis = this.gameAnalysisCache.getMoveAnalysis(i);
            cachedAnalyses.push(analysis);
        }

        // Vérifier si on a tout en cache
        const missingCache = cachedAnalyses.some(analysis => analysis === null);
        const availableCount = cachedAnalyses.filter(a => a !== null).length;

        if (missingCache) {

            // Essayer avec les analyses disponibles seulement
            const validAnalyses = cachedAnalyses.filter((analysis): analysis is CachedMoveAnalysis => analysis !== null);
            if (validAnalyses.length > 0) {
                this.segments = this.generateSegmentsFromCache(validAnalyses);
                return;
            } else {
                this.generateEmptyState();
                return;
            }
        }

        // Générer les segments basés sur les clés de conseil
        this.segments = this.generateSegmentsFromCache(cachedAnalyses as CachedMoveAnalysis[]);
    }

    /**
     * Génère les segments en groupant les positions par clé de conseil identique
     */
    private generateSegmentsFromCache(cachedAnalyses: CachedMoveAnalysis[]): TimelineSegment[] {
        if (cachedAnalyses.length === 0) {
            return [];
        }

        const segments: TimelineSegment[] = [];
        let currentSegment: TimelineSegment | null = null;

        for (let i = 0; i < cachedAnalyses.length; i++) {
            const analysis = cachedAnalyses[i];
            const adviceKey = this.getAdviceKeyFromAnalysis(analysis);

            // Si c'est le début ou si la clé change, créer un nouveau segment
            if (!currentSegment || currentSegment.adviceKey !== adviceKey) {
                // Terminer le segment précédent
                if (currentSegment) {
                    currentSegment.endMove = i - 1;
                    segments.push(currentSegment);
                }

                // Créer un nouveau segment
                currentSegment = {
                    id: `segment-${i}-${adviceKey}`, // ID unique basé sur position et clé
                    startMove: i,
                    endMove: i, // sera mis à jour
                    adviceKey: adviceKey,
                    advantageColor: this.getAdvantageColorFromAnalysis(analysis),
                    strength: this.getStrengthFromAnalysis(analysis),
                    description: this.getDescriptionFromAnalysis(analysis),
                    whiteAdvantages: analysis.whiteAdvantages,
                    blackAdvantages: analysis.blackAdvantages,
                    whiteAdvice: analysis.whiteAdvice,
                    blackAdvice: analysis.blackAdvice,
                    whiteDirection: this.getDirectionFromCache(analysis, 'white'),
                    blackDirection: this.getDirectionFromCache(analysis, 'black')
                };
            }
        }

        // Terminer le dernier segment
        if (currentSegment) {
            currentSegment.endMove = cachedAnalyses.length - 1;
            segments.push(currentSegment);
        }

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
 * Obtient la direction stratégique depuis le cache pour une couleur donnée
 */
    private getDirectionFromCache(analysis: CachedMoveAnalysis, color: 'white' | 'black'): string {
        // Utiliser directement les directions du cache (plus fiable et cohérent)
        const direction = color === 'white' ? analysis.whiteDirection : analysis.blackDirection;
        return direction || '';
    }

    /**
     * État vide quand le cache n'est pas disponible
     */
    private generateEmptyState() {
        this.segments = [];
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
        // CHANGEMENT : Utiliser la couleur active au lieu de la couleur avantagée
        const activeColor = this.getActiveColor();
        const direction = activeColor === 'white' ? segment.whiteDirection : segment.blackDirection;

        // Obtenir la couleur de base selon la direction de la couleur active
        return getDirectionColor(direction);
    }

    getCurrentPosition(): number {
        const currentMove = this.currentMoveIndex();
        const maxMoves = (this.maxMoves() + 1);
        return maxMoves > 0 ? ((currentMove + 0.5) / maxMoves) * 100 : 0;
    }

    getAllMoves(): number[] {
        const maxMoves = this.maxMoves();
        return Array.from({ length: maxMoves + 1 }, (_, i) => i + 1);
    }

    getMovePosition(move: number): number {
        const maxMoves = this.maxMoves();
        return maxMoves > 0 ? ((move - 1) / (maxMoves + 1)) * 100 : 0;
    }

    getMoveLabel(move: number): string {
        // Afficher le chiffre seulement sur les coups pairs (2, 4, 6...)
        if (move % 2 === 0) {
            return Math.ceil(move / 2).toString();
        }
        return ''; // Pas de label pour les coups impairs
    }

    getHoveredSegment(): TimelineSegment | null {
        if (this.hoveredMove === null) return null;

        return this.segments.find(segment =>
            this.hoveredMove! >= segment.startMove && this.hoveredMove! <= segment.endMove
        ) || null;
    }



    // === MÉTHODES POUR LE TOOLTIP SIMPLIFIÉ ===

    /**
     * Détermine la couleur active basée sur l'orientation de l'échiquier
     */
    getActiveColor(): 'white' | 'black' {
        return this.boardDisplay.boardOrientation() === 'white' ? 'white' : 'black';
    }

    /**
     * Obtient le conseil pour un segment basé sur la couleur active
     */
    getSegmentAdvice(segment: TimelineSegment): string {
        const activeColor = this.getActiveColor();
        return activeColor === 'white' ? segment.whiteAdvice : segment.blackAdvice;
    }

    /**
     * Obtient l'icône de direction pour un segment basée sur la couleur active
     */
    getSegmentDirectionIcon(segment: TimelineSegment): string {
        const activeColor = this.getActiveColor();
        const direction = activeColor === 'white' ? segment.whiteDirection : segment.blackDirection;
        return direction ? getDirectionIcon(direction) : '';
    }

    /**
     * Obtient la couleur de direction pour un segment basée sur la couleur active
     */
    getSegmentDirectionColor(segment: TimelineSegment): string {
        const activeColor = this.getActiveColor();
        const direction = activeColor === 'white' ? segment.whiteDirection : segment.blackDirection;
        return getDirectionColor(direction);
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
        } else if (this.segments.length > this.maxMoves() / 2) {
            return 'Partie très dynamique avec de nombreux retournements';
        } else if (this.segments.length > this.maxMoves() / 3) {
            return 'Partie tactique avec de fréquents changements stratégiques';
        } else {
            return 'Partie positionnelle avec des phases stratégiques longues';
        }
    }

} 