import { Injectable, signal, ElementRef, effect, computed } from '@angular/core';
import { timer, Subject, Subscription } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

export type BackgroundType = 'heatmap' | 'classic';

@Injectable({
    providedIn: 'root'
})
export class BoardDisplayService {
    // Signaux pour la configuration de l'échiquier avec persistance
    selectedBackground = signal<BackgroundType>(this.loadBackgroundFromStorage());
    brightness = signal<number>(25);
    boardScale = signal<number>(1);

    // Gestion intelligente de l'orientation
    private automaticOrientation = signal<'white' | 'black'>('white');
    private userOrientationOverride = signal<'white' | 'black' | null>(this.loadOrientationOverrideFromStorage());

    // Orientation effective (computed) - priorité à l'override utilisateur
    boardOrientation = computed(() => {
        const override = this.userOrientationOverride();
        const automatic = this.automaticOrientation();

        if (override !== null) {
            return override; // L'utilisateur a une préférence
        }
        return automatic; // Utiliser l'automatique
    });

    private resizeObserver?: ResizeObserver;
    private resizeSubject = new Subject<ElementRef<HTMLElement>>();
    private resizeSubscription?: Subscription;

    constructor() {
        // Sauvegarder automatiquement quand le background change
        effect(() => {
            const background = this.selectedBackground();
            localStorage.setItem('hotpawn-background', background);
        });

        // Sauvegarder l'override d'orientation automatiquement
        effect(() => {
            const override = this.userOrientationOverride();
            if (override !== null) {
                localStorage.setItem('hotpawn-orientation-override', override);
            } else {
                localStorage.removeItem('hotpawn-orientation-override');
            }
        });

        // Configuration du debounce pour les recalculs de scale
        this.resizeSubscription = this.resizeSubject.pipe(
            debounceTime(100) // Attendre 100ms avant de recalculer
        ).subscribe(element => {
            this.calculateBoardScale(element);
        });
    }

    /**
     * Charge le mode d'affichage depuis le localStorage
     */
    private loadBackgroundFromStorage(): BackgroundType {
        try {
            const stored = localStorage.getItem('hotpawn-background');
            if (stored === 'heatmap' || stored === 'classic') {
                return stored;
            }
        } catch (error) {
            console.warn('Erreur lors du chargement des préférences:', error);
        }
        return 'classic'; // Valeur par défaut changée
    }

    /**
     * Charge l'override d'orientation depuis le localStorage
     */
    private loadOrientationOverrideFromStorage(): 'white' | 'black' | null {
        try {
            const stored = localStorage.getItem('hotpawn-orientation-override');
            if (stored === 'white' || stored === 'black') {
                return stored;
            }
        } catch (error) {
            console.warn('Erreur lors du chargement de l\'orientation override:', error);
        }
        return null; // Pas d'override par défaut
    }

    /**
     * Définit l'orientation automatique (utilisée par le mode play)
     */
    setAutomaticOrientation(orientation: 'white' | 'black'): void {
        this.automaticOrientation.set(orientation);
    }

    /**
     * Bascule l'orientation manuelle (flip board)
     */
    flipBoardOrientation(): void {
        const current = this.boardOrientation();
        const newOrientation = current === 'white' ? 'black' : 'white';
        this.userOrientationOverride.set(newOrientation);
    }

    /**
     * Remet l'orientation en mode automatique (supprime l'override)
     */
    resetToAutomaticOrientation(): void {
        this.userOrientationOverride.set(null);
    }

    /**
     * Indique si l'utilisateur a un override actif
     */
    hasOrientationOverride(): boolean {
        return this.userOrientationOverride() !== null;
    }

    /**
     * Force un override d'orientation (pour le mode analyze)
     */
    setOrientationOverride(orientation: 'white' | 'black'): void {
        this.userOrientationOverride.set(orientation);
    }

    /**
     * Configure l'observateur de redimensionnement pour un élément
     */
    setupResizeObserver(element: ElementRef<HTMLElement>): void {
        // Nettoyer l'ancien observer s'il existe
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }

        // Calcul initial
        this.calculateBoardScale(element);

        // Créer le nouvel observer
        this.resizeObserver = new ResizeObserver(() => {
            // Débouncer les recalculs pour éviter les problèmes lors des changements de focus
            this.resizeSubject.next(element);
        });
        this.resizeObserver.observe(element.nativeElement);
    }

    /**
     * Nettoie l'observateur de redimensionnement
     */
    cleanup(): void {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = undefined;
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
     * Toggle entre heatmap et classic via checkbox avec sauvegarde automatique
     */
    toggleExperimentalMode(event: Event): void {
        const target = event.target as HTMLInputElement;
        const isExperimental = target.checked;
        this.selectedBackground.set(isExperimental ? 'heatmap' : 'classic');
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
        console.log('🎯 BoardDisplay: calculateBoardScale called');

        if (!boardSection) {
            console.log('🎯 BoardDisplay: No boardSection provided');
            return;
        }

        const container = boardSection.nativeElement;
        const containerRect = container.getBoundingClientRect();

        // Vérifier que les dimensions sont valides
        if (containerRect.width === 0 || containerRect.height === 0) {
            console.log('🎯 BoardDisplay: Invalid dimensions, skipping scale calculation');
            return;
        }

        // Obtenir les dimensions disponibles (en soustrayant le padding)
        const availableWidth = containerRect.width; // 2rem padding
        const availableHeight = containerRect.height;

        // Calculer l'échelle pour chaque dimension avec les vraies dimensions de l'échiquier
        const scaleX = availableWidth / 480;  // Largeur réelle
        const scaleY = availableHeight / 484; // Hauteur réelle

        // Prendre la plus petite échelle (la plus contraignante)
        let scale = Math.min(scaleX, scaleY);
        // scale = Math.max(0.5, Math.min(2.5, scale));

        console.log('🎯 BoardDisplay: Scale calculation:', {
            availableWidth,
            availableHeight,
            scaleX: scaleX.toFixed(2),
            scaleY: scaleY.toFixed(2),
            finalScale: scale.toFixed(2),
            currentScale: this.boardScale().toFixed(2)
        });

        this.boardScale.set(scale);
    }
} 