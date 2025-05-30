import { Injectable, signal, ElementRef, effect } from '@angular/core';

export type BackgroundType = 'heatmap' | 'topographic';

@Injectable({
    providedIn: 'root'
})
export class BoardDisplayService {
    // Signaux pour la configuration de l'échiquier avec persistance
    selectedBackground = signal<BackgroundType>(this.loadBackgroundFromStorage());
    brightness = signal<number>(25);
    boardScale = signal<number>(1);

    private resizeObserver?: ResizeObserver;

    constructor() {
        // Sauvegarder automatiquement quand le background change
        effect(() => {
            const background = this.selectedBackground();
            localStorage.setItem('hotpawn-background', background);
        });
    }

    /**
     * Charge le mode d'affichage depuis le localStorage
     */
    private loadBackgroundFromStorage(): BackgroundType {
        try {
            const stored = localStorage.getItem('hotpawn-background');
            if (stored === 'heatmap' || stored === 'topographic') {
                return stored;
            }
        } catch (error) {
            console.warn('Erreur lors du chargement des préférences:', error);
        }
        return 'heatmap'; // Valeur par défaut
    }

    /**
     * Configure l'observateur de redimensionnement pour un élément
     */
    setupResizeObserver(element: ElementRef<HTMLElement>): void {
        this.calculateBoardScale(element);
        this.resizeObserver = new ResizeObserver(() => this.calculateBoardScale(element));
        this.resizeObserver.observe(element.nativeElement);
    }

    /**
     * Nettoie l'observateur de redimensionnement
     */
    cleanup(): void {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }

    /**
     * Définit le type de background avec sauvegarde automatique
     */
    setBackground(background: BackgroundType): void {
        this.selectedBackground.set(background);
        // La sauvegarde se fait automatiquement via l'effect()
    }

    /**
     * Toggle entre heatmap et topographic via checkbox avec sauvegarde automatique
     */
    toggleExperimentalMode(event: Event): void {
        const target = event.target as HTMLInputElement;
        const isExperimental = target.checked;
        this.selectedBackground.set(isExperimental ? 'topographic' : 'heatmap');
        // La sauvegarde se fait automatiquement via l'effect()
    }

    /**
     * Calcule la couleur de fond de l'échiquier basée sur la luminosité
     */
    getBoardBackgroundColor(): string {
        const brightnessValue = this.brightness();
        // Convertir la valeur 0-100 en couleur RGB (0,0,0) à (255,255,255)
        const rgbValue = Math.round((brightnessValue / 100) * 255);
        return `rgb(${rgbValue}, ${rgbValue}, ${rgbValue})`;
    }

    /**
     * Calcule l'échelle de l'échiquier en fonction des dimensions du conteneur
     */
    private calculateBoardScale(boardSection: ElementRef<HTMLElement>): void {
        if (!boardSection) return;

        const container = boardSection.nativeElement;
        const containerRect = container.getBoundingClientRect();

        // Obtenir les dimensions disponibles (en soustrayant le padding)
        const availableWidth = containerRect.width - 32; // 2rem padding
        const availableHeight = containerRect.height - 32;

        // Calculer l'échelle pour chaque dimension avec les vraies dimensions de l'échiquier
        const scaleX = availableWidth / 550;  // Largeur réelle avec notations
        const scaleY = availableHeight / 593; // Hauteur réelle avec notations

        // Prendre la plus petite échelle (la plus contraignante)
        const scale = Math.max(0.5, Math.min(2.5, Math.min(scaleX, scaleY)));

        this.boardScale.set(scale);
    }
} 