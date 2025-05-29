import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chess } from 'chess.js';
import { ChessService } from '../services/chess.service';

interface ContourPoint {
  x: number;
  y: number;
  value: number;
}

@Component({
  selector: 'app-topographic',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topographic.component.html',
  styleUrl: './topographic.component.scss'
})
export class TopographicComponent implements OnChanges, AfterViewInit {
  @Input() position: string = '';
  @ViewChild('topoCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private chess = new Chess();
  private ctx!: CanvasRenderingContext2D;
  private canvasWidth = 480;
  private canvasHeight = 480;
  private resolution = 96; // Grille haute résolution pour interpolation

  constructor(private chessService: ChessService) { }

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = this.canvasWidth;
    canvas.height = this.canvasHeight;
    this.ctx = canvas.getContext('2d')!;
    this.updateTopography();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['position'] && this.ctx) {
      this.updateTopography();
    }
  }

  private updateTopography() {
    if (this.position) {
      this.chess.load(this.position);
    }

    // Nettoyer le canvas
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Générer la grille de contrôle de base (8x8)
    const baseGrid = this.generateBaseControlGrid();

    // Créer une grille haute résolution par interpolation
    const highResGrid = this.interpolateGrid(baseGrid);

    // Dessiner le fond avec dégradés fluides
    this.drawSmoothBackground(highResGrid);

    // Dessiner les pièces d'échecs
    this.drawChessPieces();
  }

  private generateBaseControlGrid(): number[][] {
    const grid: number[][] = [];
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    for (let rank = 8; rank >= 1; rank--) {
      const row: number[] = [];
      for (let fileIndex = 0; fileIndex < 8; fileIndex++) {
        const square = `${files[fileIndex]}${rank}`;
        const control = this.chessService.calculateSquareControl(this.chess, square);

        // Convertir en valeur continue
        let value = control.netControl;
        // Amplifier pour avoir de meilleurs contrastes
        value = value * 1.5;

        row.push(value);
      }
      grid.push(row);
    }

    return grid;
  }

  private interpolateGrid(baseGrid: number[][]): number[][] {
    const interpolated: number[][] = [];
    const scale = this.resolution / 8;

    for (let y = 0; y < this.resolution; y++) {
      const row: number[] = [];
      for (let x = 0; x < this.resolution; x++) {
        // Position dans la grille 8x8 avec centrage sur les cases
        const gx = (x + 0.5) / scale - 0.5;
        const gy = (y + 0.5) / scale - 0.5;

        // Interpolation bilinéaire
        const value = this.bilinearInterpolation(baseGrid, gx, gy);
        row.push(value);
      }
      interpolated.push(row);
    }

    return interpolated;
  }

  private bilinearInterpolation(grid: number[][], x: number, y: number): number {
    const x0 = Math.floor(x);
    const x1 = Math.min(x0 + 1, 7);
    const y0 = Math.floor(y);
    const y1 = Math.min(y0 + 1, 7);

    const fx = x - x0;
    const fy = y - y0;

    const v00 = grid[y0]?.[x0] ?? 0;
    const v10 = grid[y0]?.[x1] ?? 0;
    const v01 = grid[y1]?.[x0] ?? 0;
    const v11 = grid[y1]?.[x1] ?? 0;

    // Interpolation bilinéaire
    const v0 = v00 * (1 - fx) + v10 * fx;
    const v1 = v01 * (1 - fx) + v11 * fx;

    return v0 * (1 - fy) + v1 * fy;
  }

  private drawSmoothBackground(grid: number[][]) {
    const imageData = this.ctx.createImageData(this.canvasWidth, this.canvasHeight);
    const data = imageData.data;

    for (let y = 0; y < this.canvasHeight; y++) {
      for (let x = 0; x < this.canvasWidth; x++) {
        // Centrer les coordonnées sur les cases d'échiquier
        const gx = (x / this.canvasWidth) * this.resolution;
        const gy = (y / this.canvasHeight) * this.resolution;

        const gridX = Math.min(Math.floor(gx), this.resolution - 1);
        const gridY = Math.min(Math.floor(gy), this.resolution - 1);

        const value = grid[gridY]?.[gridX] ?? 0;
        const color = this.getColorForValue(value);

        const index = (y * this.canvasWidth + x) * 4;
        data[index] = color.r;     // Rouge
        data[index + 1] = color.g; // Vert
        data[index + 2] = color.b; // Bleu
        data[index + 3] = color.a; // Alpha
      }
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  private getColorForValue(value: number): { r: number, g: number, b: number, a: number } {
    // Appliquer des seuils pour créer des zones de couleur unie
    let level: number;

    if (value >= 3) level = 4;      // Très fort contrôle
    else if (value >= 2) level = 3;  // Fort contrôle
    else if (value >= 1) level = 2;  // Contrôle modéré
    else if (value > 0) level = 1;   // Faible contrôle
    else if (value === 0) level = 0; // Neutre
    else if (value > -1) level = -1; // Faible contrôle opposé
    else if (value >= -2) level = -2; // Contrôle modéré opposé
    else if (value >= -3) level = -3; // Fort contrôle opposé
    else level = -4;                 // Très fort contrôle opposé

    // Couleurs par paliers pour les blancs (feu) - même couleur que heatmap (255, 69, 0)
    if (level > 0) {
      const baseR = 255, baseG = 69, baseB = 0;
      switch (level) {
        case 4: return { r: baseR, g: baseG, b: baseB, a: 220 };    // Intensité maximale
        case 3: return { r: baseR, g: baseG + 30, b: baseB, a: 180 }; // Légèrement plus orange
        case 2: return { r: baseR, g: baseG + 60, b: baseB + 30, a: 140 }; // Plus orange
        case 1: return { r: baseR, g: baseG + 100, b: baseB + 80, a: 100 }; // Orange clair
        default: return { r: 240, g: 240, b: 240, a: 30 };
      }
    }
    // Couleurs par paliers pour les noirs (eau) - même couleur que heatmap (0, 150, 255)
    else if (level < 0) {
      const baseR = 0, baseG = 150, baseB = 255;
      switch (level) {
        case -4: return { r: baseR, g: baseG - 50, b: baseB - 50, a: 220 }; // Bleu plus foncé
        case -3: return { r: baseR + 20, g: baseG - 30, b: baseB - 30, a: 180 }; // Bleu moyen foncé
        case -2: return { r: baseR + 40, g: baseG - 10, b: baseB - 10, a: 140 }; // Bleu moyen
        case -1: return { r: baseR + 80, g: baseG + 20, b: baseB, a: 100 }; // Bleu clair
        default: return { r: 240, g: 240, b: 240, a: 30 };
      }
    }
    // Zone neutre
    else {
      return { r: 240, g: 240, b: 240, a: 30 };
    }
  }

  private drawChessPieces() {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const cellSize = this.canvasWidth / 8;

    this.ctx.font = `${cellSize * 0.5}px serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    for (let rank = 8; rank >= 1; rank--) {
      for (let fileIndex = 0; fileIndex < 8; fileIndex++) {
        const square = `${files[fileIndex]}${rank}`;
        const piece = this.chess.get(square as any);

        if (piece) {
          const symbol = this.chessService.getPieceSymbol(piece);
          const x = fileIndex * cellSize + cellSize / 2;
          const y = (8 - rank) * cellSize + cellSize / 2;

          // Ombre portée
          this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
          this.ctx.fillText(symbol, x + 2, y + 2);

          // Pièce
          this.ctx.fillStyle = piece.color === 'w' ? '#fff' : '#000';
          this.ctx.fillText(symbol, x, y);
        }
      }
    }
  }
}
