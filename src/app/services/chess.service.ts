import { Injectable } from '@angular/core';
import { Chess, Square } from 'chess.js';

// Interfaces partagées
export interface SquareControl {
  square: string;
  whiteControl: number;
  blackControl: number;
  netControl: number; // positif = blanc domine, négatif = noir domine
}

export interface ChessSquare {
  file: string;
  rank: number;
  square: string;
  piece: any;
  isLight: boolean;
}

export interface HeatmapSquare extends ChessSquare {
  control: SquareControl;
}

@Injectable({
  providedIn: 'root'
})
export class ChessService {

  constructor() { }

  // === MÉTHODES UTILITAIRES POUR LES PIÈCES ===

  getPieceSymbol(piece: any): string {
    if (!piece) return '';

    const symbols: { [key: string]: string } = {
      'p': piece.color === 'w' ? '♙' : '♟',
      'r': piece.color === 'w' ? '♖' : '♜',
      'n': piece.color === 'w' ? '♘' : '♞',
      'b': piece.color === 'w' ? '♗' : '♝',
      'q': piece.color === 'w' ? '♕' : '♛',
      'k': piece.color === 'w' ? '♔' : '♚'
    };

    return symbols[piece.type as string] || '';
  }

  getPieceTypeName(type: string): string {
    const types: { [key: string]: string } = {
      'p': 'Pion',
      'r': 'Tour',
      'n': 'Cavalier',
      'b': 'Fou',
      'q': 'Reine',
      'k': 'Roi'
    };
    return types[type] || 'Pièce inconnue';
  }

  // === GÉNÉRATION DES BOARDS ===

  generateChessBoard(chess: Chess): ChessSquare[] {
    const squares: ChessSquare[] = [];
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    for (let rank = 8; rank >= 1; rank--) {
      for (let fileIndex = 0; fileIndex < 8; fileIndex++) {
        const file = files[fileIndex];
        const square = `${file}${rank}`;
        const piece = chess.get(square as Square);
        const isLight = (fileIndex + rank) % 2 === 0;

        squares.push({
          file,
          rank,
          square,
          piece,
          isLight
        });
      }
    }

    return squares;
  }

  generateHeatmapBoard(chess: Chess): HeatmapSquare[] {
    const squares: HeatmapSquare[] = [];
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    for (let rank = 8; rank >= 1; rank--) {
      for (let fileIndex = 0; fileIndex < 8; fileIndex++) {
        const file = files[fileIndex];
        const square = `${file}${rank}`;
        const piece = chess.get(square as Square);
        const isLight = (fileIndex + rank) % 2 === 0;
        const control = this.calculateSquareControl(chess, square);

        squares.push({
          file,
          rank,
          square,
          piece,
          isLight,
          control
        });
      }
    }

    return squares;
  }

  // === CALCUL DU CONTRÔLE DES CASES ===

  calculateSquareControl(chess: Chess, square: string): SquareControl {
    let whiteControl = 0;
    let blackControl = 0;

    // Parcourir toutes les cases de l'échiquier
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = [1, 2, 3, 4, 5, 6, 7, 8];

    for (const file of files) {
      for (const rank of ranks) {
        const pieceSquare = `${file}${rank}` as Square;
        const piece = chess.get(pieceSquare);

        if (piece && this.isSquareAttackedByPiece(chess, pieceSquare, square, piece)) {
          if (piece.color === 'w') {
            whiteControl++;
          } else {
            blackControl++;
          }
        }
      }
    }

    return {
      square,
      whiteControl,
      blackControl,
      netControl: whiteControl - blackControl
    };
  }

  // Vérifie si une pièce donnée attaque une case donnée
  private isSquareAttackedByPiece(chess: Chess, fromSquare: string, toSquare: string, piece: any): boolean {
    const fromFile = fromSquare.charCodeAt(0) - 97; // a=0, b=1, etc.
    const fromRank = parseInt(fromSquare[1]) - 1;   // 1=0, 2=1, etc.
    const toFile = toSquare.charCodeAt(0) - 97;
    const toRank = parseInt(toSquare[1]) - 1;

    const fileDiff = Math.abs(toFile - fromFile);
    const rankDiff = Math.abs(toRank - fromRank);
    const fileDir = toFile > fromFile ? 1 : toFile < fromFile ? -1 : 0;
    const rankDir = toRank > fromRank ? 1 : toRank < fromRank ? -1 : 0;

    switch (piece.type) {
      case 'p': // Pion
        if (piece.color === 'w') {
          // Pion blanc attaque en diagonale vers le haut
          return rankDiff === 1 && fileDiff === 1 && (toRank - fromRank) === 1;
        } else {
          // Pion noir attaque en diagonale vers le bas  
          return rankDiff === 1 && fileDiff === 1 && (toRank - fromRank) === -1;
        }

      case 'r': // Tour
        if (fromFile === toFile || fromRank === toRank) {
          return this.isPathClear(chess, fromSquare, toSquare, fileDir, rankDir);
        }
        return false;

      case 'n': // Cavalier
        return (fileDiff === 2 && rankDiff === 1) || (fileDiff === 1 && rankDiff === 2);

      case 'b': // Fou
        if (fileDiff === rankDiff && fileDiff > 0) {
          return this.isPathClear(chess, fromSquare, toSquare, fileDir, rankDir);
        }
        return false;

      case 'q': // Reine (combine Tour + Fou)
        if ((fromFile === toFile || fromRank === toRank) || (fileDiff === rankDiff && fileDiff > 0)) {
          return this.isPathClear(chess, fromSquare, toSquare, fileDir, rankDir);
        }
        return false;

      case 'k': // Roi
        return fileDiff <= 1 && rankDiff <= 1 && (fileDiff > 0 || rankDiff > 0);

      default:
        return false;
    }
  }

  // Vérifie si le chemin entre deux cases est libre (pour tour, fou, reine)
  private isPathClear(chess: Chess, fromSquare: string, toSquare: string, fileDir: number, rankDir: number): boolean {
    const fromFile = fromSquare.charCodeAt(0) - 97;
    const fromRank = parseInt(fromSquare[1]) - 1;
    const toFile = toSquare.charCodeAt(0) - 97;
    const toRank = parseInt(toSquare[1]) - 1;

    let currentFile = fromFile + fileDir;
    let currentRank = fromRank + rankDir;

    // Parcourir le chemin sans inclure les cases de départ et d'arrivée
    while (currentFile !== toFile || currentRank !== toRank) {
      const currentSquare = String.fromCharCode(97 + currentFile) + (currentRank + 1);
      const pieceOnPath = chess.get(currentSquare as Square);

      if (pieceOnPath) {
        return false; // Chemin bloqué
      }

      currentFile += fileDir;
      currentRank += rankDir;
    }

    return true; // Chemin libre
  }

  // === STYLES POUR LA HEATMAP ===

  getSquareControlStyle(control: SquareControl): any {
    // Calculer la différence absolue pour l'épaisseur
    const controlDifference = Math.abs(control.netControl);

    // Pas de contrôle = pas de bordure
    if (controlDifference === 0 && control.whiteControl === 0 && control.blackControl === 0) {
      return {};
    }

    // Déterminer l'épaisseur (2px à 8px selon l'intensité)
    const borderWidth = Math.min(Math.max(controlDifference * 2, 2), 8);

    if (control.netControl > 0) {
      // Contrôle blanc dominant
      return {
        'border': `${borderWidth}px solid rgb(255, 255, 255)`,
        'box-shadow': `inset 0 0 ${borderWidth * 4}px rgba(255, 255, 255, 0.6)`,
        'transform': `scale(${1 + controlDifference * 0.02})`,
        'z-index': controlDifference + 10
      };
    } else if (control.netControl < 0) {
      // Contrôle noir dominant
      return {
        'border': `${borderWidth}px solid rgb(20, 20, 20)`,
        'box-shadow': `inset 0 0 ${borderWidth * 4}px rgba(20, 20, 20, 0.7)`,
        'transform': `scale(${1 + controlDifference * 0.02})`,
        'z-index': controlDifference + 10
      };
    } else if (control.whiteControl > 0 && control.blackControl > 0) {
      // Case contestée (égalité)
      const contestedWidth = Math.min(Math.max(control.whiteControl * 2, 3), 6);
      return {
        'border': `${contestedWidth}px solid rgb(255, 193, 7)`,
        'box-shadow': `inset 0 0 ${contestedWidth * 5}px rgba(255, 193, 7, 0.6)`,
        'transform': `scale(${1 + control.whiteControl * 0.03})`,
        'z-index': control.whiteControl + 15,
        'animation': 'pulse-contested 2s infinite'
      };
    }

    return {};
  }

  // === TOOLTIPS ===

  getChessSquareTooltip(square: ChessSquare): string {
    let tooltip = `Case ${square.square.toUpperCase()}`;

    if (square.piece) {
      const pieceColor = square.piece.color === 'w' ? 'Blanc' : 'Noir';
      const pieceType = this.getPieceTypeName(square.piece.type);
      tooltip += `\n${pieceColor} ${pieceType}`;
    }

    return tooltip;
  }

  getHeatmapSquareTooltip(square: HeatmapSquare): string {
    let tooltip = `Case ${square.square.toUpperCase()}`;

    if (square.piece) {
      const pieceColor = square.piece.color === 'w' ? 'Blanc' : 'Noir';
      const pieceType = this.getPieceTypeName(square.piece.type);
      tooltip += `\n${pieceColor} ${pieceType}`;
    }

    const control = square.control;
    if (control.whiteControl > 0 || control.blackControl > 0) {
      tooltip += `\nContrôle: ${control.whiteControl} blanc(s), ${control.blackControl} noir(s)`;
      if (control.netControl > 0) {
        tooltip += `\nDominance: Blancs (+${control.netControl})`;
      } else if (control.netControl < 0) {
        tooltip += `\nDominance: Noirs (${control.netControl})`;
      } else if (control.whiteControl > 0) {
        tooltip += `\nCase contestée`;
      }
    } else {
      tooltip += `\nAucun contrôle`;
    }

    return tooltip;
  }
}
