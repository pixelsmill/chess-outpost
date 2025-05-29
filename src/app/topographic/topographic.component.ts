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
  private resolution = 960; // Grille haute résolution pour interpolation pixel par pixel

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
    const baseGrids = this.generateBaseControlGrid();

    // Créer une grille haute résolution par interpolation
    const highResGrids = this.interpolateGrids(baseGrids);

    // Dessiner le fond avec dégradés fluides
    this.drawSmoothBackground(highResGrids);

    // Dessiner les pièces d'échecs
    this.drawChessPieces();
  }

  private generateBaseControlGrid(): { netControl: number[][], whiteControl: number[][], blackControl: number[][] } {
    const netGrid: number[][] = [];
    const whiteGrid: number[][] = [];
    const blackGrid: number[][] = [];
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    for (let rank = 8; rank >= 1; rank--) {
      const netRow: number[] = [];
      const whiteRow: number[] = [];
      const blackRow: number[] = [];
      for (let fileIndex = 0; fileIndex < 8; fileIndex++) {
        const square = `${files[fileIndex]}${rank}`;
        const control = this.chessService.calculateSquareControl(this.chess, square);

        // Amplifier pour avoir de meilleurs contrastes
        const netValue = control.netControl * 1.5;

        netRow.push(netValue);
        whiteRow.push(control.whiteControl);
        blackRow.push(control.blackControl);
      }
      netGrid.push(netRow);
      whiteGrid.push(whiteRow);
      blackGrid.push(blackRow);
    }

    return { netControl: netGrid, whiteControl: whiteGrid, blackControl: blackGrid };
  }

  private interpolateGrids(baseGrids: { netControl: number[][], whiteControl: number[][], blackControl: number[][] }): { netControl: number[][], whiteControl: number[][], blackControl: number[][] } {
    const interpolatedNet: number[][] = [];
    const interpolatedWhite: number[][] = [];
    const interpolatedBlack: number[][] = [];
    const scale = this.resolution / 8;

    for (let y = 0; y < this.resolution; y++) {
      const netRow: number[] = [];
      const whiteRow: number[] = [];
      const blackRow: number[] = [];
      for (let x = 0; x < this.resolution; x++) {
        // Position dans la grille 8x8 avec centrage sur les cases
        const gx = (x + 0.5) / scale - 0.5;
        const gy = (y + 0.5) / scale - 0.5;

        // Interpolation bicubique pour chaque type de contrôle
        const netValue = this.bicubicInterpolation(baseGrids.netControl, gx, gy);
        const whiteValue = this.bicubicInterpolation(baseGrids.whiteControl, gx, gy);
        const blackValue = this.bicubicInterpolation(baseGrids.blackControl, gx, gy);

        netRow.push(netValue);
        whiteRow.push(whiteValue);
        blackRow.push(blackValue);
      }
      interpolatedNet.push(netRow);
      interpolatedWhite.push(whiteRow);
      interpolatedBlack.push(blackRow);
    }

    return { netControl: interpolatedNet, whiteControl: interpolatedWhite, blackControl: interpolatedBlack };
  }

  private bicubicInterpolation(grid: number[][], x: number, y: number): number {
    const x1 = Math.floor(x);
    const y1 = Math.floor(y);

    const fx = x - x1;
    const fy = y - y1;

    // Récupérer les 16 points de la grille 4x4
    const points: number[] = [];
    for (let j = -1; j <= 2; j++) {
      for (let i = -1; i <= 2; i++) {
        const xi = Math.max(0, Math.min(7, x1 + i));
        const yi = Math.max(0, Math.min(7, y1 + j));
        points.push(grid[yi]?.[xi] ?? 0);
      }
    }

    // Interpolation bicubique avec splines de Catmull-Rom
    const p = [];
    for (let j = 0; j < 4; j++) {
      const p0 = points[j * 4 + 0];
      const p1 = points[j * 4 + 1];
      const p2 = points[j * 4 + 2];
      const p3 = points[j * 4 + 3];
      p[j] = this.cubicInterpolate(p0, p1, p2, p3, fx);
    }

    return this.cubicInterpolate(p[0], p[1], p[2], p[3], fy);
  }

  private cubicInterpolate(p0: number, p1: number, p2: number, p3: number, t: number): number {
    // Interpolation cubique de Catmull-Rom
    const a0 = -0.5 * p0 + 1.5 * p1 - 1.5 * p2 + 0.5 * p3;
    const a1 = p0 - 2.5 * p1 + 2 * p2 - 0.5 * p3;
    const a2 = -0.5 * p0 + 0.5 * p2;
    const a3 = p1;

    return a0 * t * t * t + a1 * t * t + a2 * t + a3;
  }

  private bicubicWeight(t: number): number {
    // Cette méthode n'est plus utilisée avec la nouvelle implémentation
    const absT = Math.abs(t);
    if (absT <= 1) {
      return 1 - 2 * absT * absT + absT * absT * absT;
    } else if (absT < 2) {
      return 4 - 8 * absT + 5 * absT * absT - absT * absT * absT;
    } else {
      return 0;
    }
  }

  private drawSmoothBackground(grids: { netControl: number[][], whiteControl: number[][], blackControl: number[][] }) {
    const imageData = this.ctx.createImageData(this.canvasWidth, this.canvasHeight);
    const data = imageData.data;

    for (let y = 0; y < this.canvasHeight; y++) {
      for (let x = 0; x < this.canvasWidth; x++) {
        // Centrer les coordonnées sur les cases d'échiquier
        const gx = (x / this.canvasWidth) * this.resolution;
        const gy = (y / this.canvasHeight) * this.resolution;

        const gridX = Math.min(Math.floor(gx), this.resolution - 1);
        const gridY = Math.min(Math.floor(gy), this.resolution - 1);

        const netValue = grids.netControl[gridY]?.[gridX] ?? 0;
        const whiteValue = grids.whiteControl[gridY]?.[gridX] ?? 0;
        const blackValue = grids.blackControl[gridY]?.[gridX] ?? 0;

        const color = this.getColorForValueWithConflict(netValue, whiteValue, blackValue);

        const index = (y * this.canvasWidth + x) * 4;
        data[index] = color.r;     // Rouge
        data[index + 1] = color.g; // Vert
        data[index + 2] = color.b; // Bleu
        data[index + 3] = color.a; // Alpha
      }
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  private getColorForValueWithConflict(netValue: number, whiteValue: number, blackValue: number): { r: number, g: number, b: number, a: number } {
    // Détecter les zones de conflit (comme dans la heatmap)
    if (whiteValue > 0.5 && blackValue > 0.5) {
      // Zone contestée - couleur violette comme dans la heatmap
      const totalControl = whiteValue + blackValue;
      const contestedOpacity = Math.min(100 + (totalControl * 20), 200);
      return { r: 128, g: 0, b: 128, a: contestedOpacity }; // Violet
    }

    // Appliquer des seuils pour créer des zones de couleur unie
    let level: number;

    if (netValue >= 3) level = 4;      // Très fort contrôle
    else if (netValue >= 2) level = 3;  // Fort contrôle
    else if (netValue >= 1) level = 2;  // Contrôle modéré
    else if (netValue > 0) level = 1;   // Faible contrôle
    else if (netValue === 0) level = 0; // Neutre
    else if (netValue > -1) level = -1; // Faible contrôle opposé
    else if (netValue >= -2) level = -2; // Contrôle modéré opposé
    else if (netValue >= -3) level = -3; // Fort contrôle opposé
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
