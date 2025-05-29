import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChessService, ChessSquare, HeatmapSquare, SquareControl } from '../services/chess.service';

@Component({
  selector: 'app-square',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './square.component.html',
  styleUrl: './square.component.scss'
})
export class SquareComponent {
  @Input() square!: ChessSquare | HeatmapSquare;
  @Input() isSelected: boolean = false;
  @Input() type: 'chess' | 'heatmap' | 'topographic' = 'chess';
  @Input() showControlNumbers: boolean = false;

  @Output() squareClick = new EventEmitter<string>();

  constructor(private chessService: ChessService) { }

  onSquareClick() {
    this.squareClick.emit(this.square.square);
  }

  getPieceSymbol(): string {
    return this.chessService.getPieceSymbol(this.square.piece);
  }

  getPieceColor(): string {
    return this.square.piece ? this.square.piece.color : '';
  }

  getPieceAltText(): string {
    if (!this.square.piece) return '';
    const color = this.square.piece.color === 'w' ? 'Blanc' : 'Noir';
    const type = this.chessService.getPieceTypeName(this.square.piece.type);
    return `${color} ${type}`;
  }

  getSquareTooltip(): string {
    if (this.type === 'heatmap' && 'control' in this.square) {
      return this.chessService.getHeatmapSquareTooltip(this.square as HeatmapSquare);
    }
    return this.chessService.getChessSquareTooltip(this.square as ChessSquare);
  }

  getSquareControlStyle(): any {
    if (this.type === 'heatmap' && 'control' in this.square) {
      return this.chessService.getSquareControlStyle((this.square as HeatmapSquare).control);
    }
    return {};
  }

  getControl(): SquareControl | null {
    if (this.type === 'heatmap' && 'control' in this.square) {
      return (this.square as HeatmapSquare).control;
    }
    return null;
  }

  hasControlNumbers(): boolean {
    const control = this.getControl();
    return this.type === 'heatmap' && control !== null &&
      (control.whiteControl > 0 || control.blackControl > 0);
  }

  isContested(): boolean {
    const control = this.getControl();
    return control !== null && control.netControl === 0 && control.whiteControl > 0;
  }

  isWhiteDominance(): boolean {
    const control = this.getControl();
    return control !== null && control.netControl > 0;
  }

  isBlackDominance(): boolean {
    const control = this.getControl();
    return control !== null && control.netControl < 0;
  }
}
