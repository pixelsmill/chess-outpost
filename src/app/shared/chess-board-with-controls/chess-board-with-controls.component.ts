import { Component, input, output, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EchiquierComponent } from '../../echiquier/echiquier.component';
import { BoardWrapperComponent } from '../../board-wrapper/board-wrapper.component';
import { HeatmapBoardComponent } from '../../backgrounds/heatmap-board/heatmap-board.component';
import { TopographicBoardComponent } from '../../backgrounds/topographic-board/topographic-board.component';
import { BoardDisplayService } from '../../services/board-display.service';
import { inject } from '@angular/core';

@Component({
    selector: 'app-chess-board-with-controls',
    standalone: true,
    imports: [
        CommonModule,
        EchiquierComponent,
        BoardWrapperComponent,
        HeatmapBoardComponent,
        TopographicBoardComponent
    ],
    templateUrl: './chess-board-with-controls.component.html',
    styleUrl: './chess-board-with-controls.component.scss'
})
export class ChessBoardWithControlsComponent implements OnInit, OnDestroy, AfterViewInit {
    // ViewChild pour accéder à l'échiquier et calculer le scaling
    @ViewChild('chessBoardContainer', { static: true }) chessBoardContainer!: ElementRef<HTMLElement>;
    @ViewChild('echiquier') echiquierComponent!: EchiquierComponent;
    @ViewChild('boardControls', { static: true }) boardControls!: ElementRef<HTMLElement>;

    // Inputs
    position = input<string>('');
    orientation = input<'white' | 'black'>('white');
    disableClicks = input<boolean>(false);
    isMultiplayer = input<boolean>(false);
    showNavigationControls = input<boolean>(false); // Pour les futures flèches
    showExperimentalToggle = input<boolean>(false);

    // Navigation controls
    canGoBack = input<boolean>(false);
    canGoForward = input<boolean>(false);

    // Outputs
    positionChange = output<string>();
    moveChange = output<{ from: string; to: string; promotion?: string }>();

    // Navigation outputs
    goToStart = output<void>();
    goToPrevious = output<void>();
    goToNext = output<void>();
    goToEnd = output<void>();

    // Service d'affichage de l'échiquier
    public boardDisplay = inject(BoardDisplayService);

    ngOnInit() {
        // Initialisation du composant
    }

    ngOnDestroy() {
        // Nettoyage si nécessaire
    }

    ngAfterViewInit() {
        // Calculer le scaling initial
        this.calculateBoardScale();
    }

    onWindowResize() {
        // Recalculer le scaling quand la fenêtre est redimensionnée
        this.calculateBoardScale();
    }

    private calculateBoardScale(): void {
        // Chercher l'élément parent .board-section pour les dimensions
        const boardSection = this.chessBoardContainer.nativeElement.closest('.board-section') as HTMLElement;
        const container = boardSection || this.chessBoardContainer.nativeElement;

        const containerRect = container.getBoundingClientRect();

        // Vérifier que les dimensions sont valides
        if (containerRect.width === 0 || containerRect.height === 0) {
            return;
        }

        // Mesurer dynamiquement la hauteur des contrôles
        const controlsHeight = this.boardControls.nativeElement.getBoundingClientRect().height;

        // Calculer l'échelle en tenant compte de la nouvelle structure :
        // - Échiquier : 480x484px
        // - Contrôles sous l'échiquier : hauteur mesurée dynamiquement
        const boardWidth = 480;
        const boardHeight = 484;
        const totalHeight = boardHeight + controlsHeight;

        const scaleX = containerRect.width / boardWidth;
        const scaleY = containerRect.height / totalHeight;

        // Prendre la plus petite échelle (la plus contraignante)
        const scale = Math.max(0.5, Math.min(2.0, Math.min(scaleX, scaleY)));

        this.boardDisplay.boardScale.set(scale);
    }

    // Méthodes pour gérer les événements de l'échiquier
    onPositionChange(newPosition: string): void {
        this.positionChange.emit(newPosition);
    }

    onMoveChange(move: { from: string; to: string; promotion?: string }): void {
        this.moveChange.emit(move);
    }

    // Expose les propriétés de l'échiquier
    get gameStatus(): string {
        return this.echiquierComponent?.getGameStatus() || '';
    }

    get isGameOver(): boolean {
        return this.echiquierComponent?.isGameOver() || false;
    }

    get isCheck(): boolean {
        return this.echiquierComponent?.chess?.inCheck() || false;
    }

    // Expose les méthodes de l'échiquier
    resetGame(): void {
        if (this.echiquierComponent) {
            this.echiquierComponent.resetGame();
        }
    }

    // Méthodes pour la navigation
    onGoToStart() {
        this.goToStart.emit();
    }

    onGoToPrevious() {
        this.goToPrevious.emit();
    }

    onGoToNext() {
        this.goToNext.emit();
    }

    onGoToEnd() {
        this.goToEnd.emit();
    }
} 