import { Component, input, output, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EchiquierComponent } from '../../echiquier/echiquier.component';
import { BoardWrapperComponent } from '../../board-wrapper/board-wrapper.component';
import { HeatmapBoardComponent } from '../../backgrounds/heatmap-board/heatmap-board.component';
import { ClassicBoardComponent } from '../../backgrounds/classic-board/classic-board.component';
import { StrategicTimelineComponent } from '../strategic-timeline/strategic-timeline.component';
import { BoardDisplayService } from '../../services/board-display.service';
import { GameNavigationService } from '../../services/game-navigation.service';
import { inject } from '@angular/core';

@Component({
    selector: 'app-chess-board-with-controls',
    standalone: true,
    imports: [
        CommonModule,
        EchiquierComponent,
        BoardWrapperComponent,
        HeatmapBoardComponent,
        ClassicBoardComponent,
        StrategicTimelineComponent
    ],
    templateUrl: './chess-board-with-controls.component.html',
    styleUrl: './chess-board-with-controls.component.scss'
})
export class ChessBoardWithControlsComponent implements OnInit, OnDestroy, AfterViewInit {
    // ViewChild pour accéder à l'échiquier et calculer le scaling
    @ViewChild('gameBoard', { static: true }) gameBoardContainer!: ElementRef<HTMLElement>;
    @ViewChild('echiquier') echiquierComponent!: EchiquierComponent;

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

    // Timeline inputs - connectées au service de navigation
    gameHistory = input<string[]>([]);
    currentMoveIndex = input<number>(0);
    maxMoves = input<number>(50);

    // Outputs
    positionChange = output<string>();
    moveChange = output<{ from: string; to: string; promotion?: string }>();

    // Navigation outputs
    goToStart = output<void>();
    goToPrevious = output<void>();
    goToNext = output<void>();
    goToEnd = output<void>();

    // Board orientation output
    flipBoard = output<void>();

    // Timeline output
    timelineMoveSelected = output<number>();

    // Service d'affichage de l'échiquier
    public boardDisplay = inject(BoardDisplayService);

    // Service de navigation de jeu
    public gameNavigationService = inject(GameNavigationService);

    constructor() {
        // Initialization if needed
    }

    ngOnInit() {
        // Initialisation du composant
    }

    ngOnDestroy() {
        // Nettoyage du service d'affichage
        this.boardDisplay.cleanup();
    }

    ngAfterViewInit() {
        // Utiliser le service pour gérer le scaling avec ResizeObserver
        this.boardDisplay.setupResizeObserver(this.gameBoardContainer);
    }

    onWindowResize() {
        // Le ResizeObserver gère automatiquement les redimensionnements
        // Cette méthode peut être supprimée si elle n'est pas utilisée ailleurs
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

    onFlipBoard() {
        this.flipBoard.emit();
    }

    // Timeline methods
    onTimelineMoveSelected(moveIndex: number) {
        // Naviguer directement via le service
        this.gameNavigationService.goToMove(moveIndex);
        this.timelineMoveSelected.emit(moveIndex);
    }
} 