import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chess, Square } from 'chess.js';

interface SquareControl {
  square: string;
  whiteControl: number;
  blackControl: number;
  netControl: number; // positif = blanc domine, négatif = noir domine
}

interface ChessSquare {
  file: string;
  rank: number;
  square: string;
  piece: any;
  isLight: boolean;
  control: SquareControl;
}

@Component({
  selector: 'app-echiquier',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './echiquier.component.html',
  styleUrl: './echiquier.component.scss'
})
export class EchiquierComponent implements OnInit {
  chess = new Chess();

  // Signaux pour la réactivité
  position = signal(this.chess.fen());
  selectedSquare = signal<string | null>(null);
  visualizationMode = signal<'both'>('both');

  // Tableau de l'échiquier
  board = computed(() => {
    // S'assurer que le computed dépend du signal position
    const currentPosition = this.position();

    const squares: ChessSquare[] = [];
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    for (let rank = 8; rank >= 1; rank--) {
      for (let fileIndex = 0; fileIndex < 8; fileIndex++) {
        const file = files[fileIndex];
        const square = `${file}${rank}`;
        const piece = this.chess.get(square as Square);
        const isLight = (fileIndex + rank) % 2 === 0;
        const control = this.calculateSquareControl(square);

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
  });

  ngOnInit() {
    this.updatePosition();
  }

  calculateSquareControl(square: string): SquareControl {
    let whiteControl = 0;
    let blackControl = 0;

    // Parcourir toutes les cases de l'échiquier
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = [1, 2, 3, 4, 5, 6, 7, 8];

    for (const file of files) {
      for (const rank of ranks) {
        const pieceSquare = `${file}${rank}` as Square;
        const piece = this.chess.get(pieceSquare);

        if (piece && this.isSquareAttackedByPiece(pieceSquare, square, piece)) {
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
  private isSquareAttackedByPiece(fromSquare: string, toSquare: string, piece: any): boolean {
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
          return this.isPathClear(fromSquare, toSquare, fileDir, rankDir);
        }
        return false;

      case 'n': // Cavalier
        return (fileDiff === 2 && rankDiff === 1) || (fileDiff === 1 && rankDiff === 2);

      case 'b': // Fou
        if (fileDiff === rankDiff && fileDiff > 0) {
          return this.isPathClear(fromSquare, toSquare, fileDir, rankDir);
        }
        return false;

      case 'q': // Reine (combine Tour + Fou)
        if ((fromFile === toFile || fromRank === toRank) || (fileDiff === rankDiff && fileDiff > 0)) {
          return this.isPathClear(fromSquare, toSquare, fileDir, rankDir);
        }
        return false;

      case 'k': // Roi
        return fileDiff <= 1 && rankDiff <= 1 && (fileDiff > 0 || rankDiff > 0);

      default:
        return false;
    }
  }

  // Vérifie si le chemin entre deux cases est libre (pour tour, fou, reine)
  private isPathClear(fromSquare: string, toSquare: string, fileDir: number, rankDir: number): boolean {
    const fromFile = fromSquare.charCodeAt(0) - 97;
    const fromRank = parseInt(fromSquare[1]) - 1;
    const toFile = toSquare.charCodeAt(0) - 97;
    const toRank = parseInt(toSquare[1]) - 1;

    let currentFile = fromFile + fileDir;
    let currentRank = fromRank + rankDir;

    // Parcourir le chemin sans inclure les cases de départ et d'arrivée
    while (currentFile !== toFile || currentRank !== toRank) {
      const currentSquare = String.fromCharCode(97 + currentFile) + (currentRank + 1);
      const pieceOnPath = this.chess.get(currentSquare as Square);

      if (pieceOnPath) {
        return false; // Chemin bloqué
      }

      currentFile += fileDir;
      currentRank += rankDir;
    }

    return true; // Chemin libre
  }

  onSquareClick(square: string) {
    const currentSelected = this.selectedSquare();

    if (currentSelected === square) {
      // Désélectionner si on clique sur la même case
      this.selectedSquare.set(null);
      return;
    }

    if (currentSelected) {
      // Tentative de mouvement
      try {
        const move = this.chess.move({
          from: currentSelected as Square,
          to: square as Square,
          promotion: 'q' // Auto-promotion en reine
        });

        if (move) {
          this.updatePosition();
          this.selectedSquare.set(null);
        }
      } catch (error) {
        // Mouvement invalide, sélectionner la nouvelle case
        this.selectedSquare.set(square);
      }
    } else {
      // Sélectionner une nouvelle case
      const piece = this.chess.get(square as Square);
      if (piece && piece.color === this.chess.turn()) {
        this.selectedSquare.set(square);
      }
    }
  }

  updatePosition() {
    this.position.set(this.chess.fen());
  }

  resetGame() {
    this.chess.reset();
    this.updatePosition();
    this.selectedSquare.set(null);
  }

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

  getSquareControlStyle(control: SquareControl): any {
    // Calculer la différence absolue pour l'épaisseur
    const controlDifference = Math.abs(control.netControl);

    // Pas de contrôle = pas de bordure
    if (controlDifference === 0 && control.whiteControl === 0 && control.blackControl === 0) {
      return {};
    }

    // Déterminer l'épaisseur (2px à 8px selon l'intensité) - ACCENTUÉ
    const borderWidth = Math.min(Math.max(controlDifference * 2, 2), 8);

    if (control.netControl > 0) {
      // Contrôle blanc dominant - OMBRE INTERNE
      return {
        'border': `${borderWidth}px solid rgb(255, 255, 255)`,
        'box-shadow': `inset 0 0 ${borderWidth * 4}px rgba(255, 255, 255, 0.6)`,
        'transform': `scale(${1 + controlDifference * 0.02})`,
        'z-index': controlDifference + 10
      };
    } else if (control.netControl < 0) {
      // Contrôle noir dominant - OMBRE INTERNE
      return {
        'border': `${borderWidth}px solid rgb(20, 20, 20)`,
        'box-shadow': `inset 0 0 ${borderWidth * 4}px rgba(20, 20, 20, 0.7)`,
        'transform': `scale(${1 + controlDifference * 0.02})`,
        'z-index': controlDifference + 10
      };
    } else if (control.whiteControl > 0 && control.blackControl > 0) {
      // Case contestée (égalité) - OMBRE INTERNE
      const contestedWidth = Math.min(Math.max(control.whiteControl * 2, 3), 6);
      return {
        'border': `${contestedWidth}px solid rgb(255, 193, 7)`,
        'box-shadow': `inset 0 0 ${contestedWidth * 5}px rgba(255, 193, 7, 0.6)`,
        'transform': `scale(${1 + control.whiteControl * 0.03})`,
        'z-index': control.whiteControl + 15,
        'animation': 'contested-pulse-inset 2s infinite alternate'
      };
    }

    return {};
  }

  isSquareSelected(square: string): boolean {
    return this.selectedSquare() === square;
  }

  getCurrentTurn(): string {
    return this.chess.turn() === 'w' ? 'Blancs' : 'Noirs';
  }

  isGameOver(): boolean {
    return this.chess.isGameOver();
  }

  getGameStatus(): string {
    if (this.chess.isCheckmate()) {
      return `Échec et mat ! ${this.chess.turn() === 'w' ? 'Noirs' : 'Blancs'} gagnent`;
    }
    if (this.chess.isStalemate()) {
      return 'Pat - Match nul';
    }
    if (this.chess.isDraw()) {
      return 'Match nul';
    }
    if (this.chess.isCheck()) {
      return `Échec au roi ${this.getCurrentTurn()}`;
    }
    return `Tour des ${this.getCurrentTurn()}`;
  }

  getSquareTooltip(square: ChessSquare): string {
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

  private getPieceTypeName(type: string): string {
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
}
