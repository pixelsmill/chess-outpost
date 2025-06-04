import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chess } from 'chess.js';
import { ChessService } from '../../services/chess.service';

@Component({
  selector: 'app-topographic-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topographic-board.component.html',
  styleUrl: './topographic-board.component.scss'
})
export class TopographicBoardComponent implements OnChanges, AfterViewInit {
  @Input() position: string = '';
  @Input() orientation: 'white' | 'black' = 'white'; // Orientation de l'échiquier
  @ViewChild('topoCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private chess = new Chess();
  private ctx!: CanvasRenderingContext2D;
  public canvasWidth = 480;
  public canvasHeight = 480;
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

    // Nettoyer le canvas avec transparence totale
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    // S'assurer que le canvas a un fond transparent
    this.ctx.globalCompositeOperation = 'source-over';

    // Générer la grille de contrôle de base (8x8)
    const baseGrids = this.generateBaseControlGrid();

    // Créer une grille haute résolution par interpolation
    const highResGrids = this.interpolateGrids(baseGrids);

    // Dessiner le fond avec dégradés fluides et alpha
    this.drawSmoothBackground(highResGrids);
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
    // Si aucun contrôle significatif, afficher en BLEU (au lieu de transparent)
    if (whiteValue < 0.1 && blackValue < 0.1) {
      return { r: 70, g: 130, b: 180, a: 120 }; // Bleu acier visible
    }

    // Détecter les zones de conflit : seulement quand il y a réellement égalité (netValue proche de 0)
    // ET que les deux camps ont un contrôle significatif
    if (Math.abs(netValue) < 0.5 && whiteValue > 0.5 && blackValue > 0.5) {
      // Zone réellement contestée - couleur ORANGE (255, 165, 0) avec gamme élargie
      const totalControl = whiteValue + blackValue;
      const contestedOpacity = Math.min(50 + (totalControl * 30), 255); // Gamme élargie 50-255
      return { r: 255, g: 165, b: 0, a: contestedOpacity }; // Orange
    }

    // Calculer l'intensité basée sur les valeurs de contrôle avec gamme élargie
    const intensity = Math.abs(netValue);
    let alpha = 0;

    // Alpha progressif basé sur l'intensité avec gamme élargie (0.2 à 1.0 comme dans chess.service)
    if (intensity > 3) alpha = 255;       // Fort contrôle - opaque complet
    else if (intensity > 2) alpha = 200;  // Contrôle modéré-fort
    else if (intensity > 1) alpha = 150;  // Contrôle modéré
    else if (intensity > 0.5) alpha = 100; // Contrôle faible-modéré
    else if (intensity > 0.1) alpha = 50;  // Très faible contrôle
    else alpha = 120;                     // Aucun contrôle - bleu visible

    // Si c'est un contrôle très faible, retourner bleu
    if (alpha <= 50 && Math.abs(netValue) <= 0.1) {
      return { r: 70, g: 130, b: 180, a: 120 }; // Bleu acier visible
    }

    // Utiliser les nouvelles couleurs cohérentes avec la heatmap
    if (netValue > 0) {
      // Zones blanches - couleur BLANCHE (255, 255, 255) au lieu d'orange-rouge
      return { r: 255, g: 255, b: 255, a: alpha };
    } else if (netValue < 0) {
      // Zones noires - couleur NOIRE (0, 0, 0) au lieu de bleu cyan
      return { r: 0, g: 0, b: 0, a: alpha };
    } else {
      // Zone parfaitement neutre - bleu acier
      return { r: 70, g: 130, b: 180, a: 120 };
    }
  }
}
