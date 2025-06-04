import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
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
export class ChessBoardWithControlsComponent implements AfterViewInit {
    // ViewChild pour accéder à l'échiquier et calculer le scaling
    @ViewChild('chessBoardContainer', { static: true }) chessBoardContainer!: ElementRef<HTMLElement>;
    @ViewChild('echiquier') echiquierComponent!: EchiquierComponent;

    // Inputs pour configurer l'échiquier
    @Input() position: string = '';
    @Input() orientation: 'white' | 'black' = 'white';
    @Input() disableClicks = false;
    @Input() isMultiplayer = false;
    @Input() showNavigationControls = false; // Pour les futures flèches
    @Input() showExperimentalToggle: boolean = false;

    // Outputs pour les événements
    @Output() positionChange = new EventEmitter<string>();
    @Output() moveChange = new EventEmitter<{ from: string; to: string; promotion?: string }>();

    // Service d'affichage de l'échiquier
    public boardDisplay = inject(BoardDisplayService);

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

        // Calculer l'échelle pour chaque dimension
        const scaleX = containerRect.width / 480;  // Largeur réelle de l'échiquier
        const scaleY = containerRect.height / 484; // Hauteur réelle de l'échiquier

        // Prendre la plus petite échelle (la plus contraignante)
        const scale = Math.max(0.5, Math.min(2.5, Math.min(scaleX, scaleY)));

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
} 