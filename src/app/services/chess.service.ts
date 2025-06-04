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

export interface GameNavigation {
  currentMove: number;
  totalMoves: number;
  canGoBack: boolean;
  canGoForward: boolean;
}

// Nouvelle interface pour l'historique centralisé
export interface MoveHistoryEntry {
  san: string;        // Notation algébrique (e4, Nf3, etc.)
  from: string;       // Case de départ (e2)
  to: string;         // Case d'arrivée (e4)
  fen: string;        // Position après le coup
  timestamp?: number; // Optionnel : timestamp du coup
}

export interface GameHistory {
  moves: MoveHistoryEntry[];
  currentMoveIndex: number; // -1 = position initiale, 0 = après le 1er coup, etc.
  startingFen: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChessService {

  constructor() { }

  // === MÉTHODES UTILITAIRES POUR LES PIÈCES ===

  getPieceSymbol(piece: any): string {
    if (!piece) return '';

    // Retourner le chemin absolu vers l'image de la pièce (convention Angular standard)
    return `/assets/pieces/${piece.color}${piece.type}.png`;
  }

  getPieceUnicode(piece: any): string {
    if (!piece) return '';

    const symbols: { [key: string]: string } = {
      'p': '♟',
      'r': '♜',
      'n': '♞',
      'b': '♝',
      'q': '♛',
      'k': '♚'
    };

    return symbols[piece.type as string] || '';
  }

  getPieceWithColor(piece: any): { symbol: string, color: string } {
    if (!piece) return { symbol: '', color: '' };

    const symbols: { [key: string]: string } = {
      'p': '♟',
      'r': '♜',
      'n': '♞',
      'b': '♝',
      'q': '♛',
      'k': '♚'
    };

    return {
      symbol: symbols[piece.type as string] || '',
      color: piece.color
    };
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

        // Une pièce ne peut pas s'attaquer elle-même !
        if (piece && pieceSquare !== square && this.isSquareAttackedByPiece(chess, pieceSquare, square, piece)) {
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
    // Pas de contrôle = couleur neutre BLEUE (au lieu de grise)
    if (control.whiteControl === 0 && control.blackControl === 0) {
      return {
        backgroundColor: 'rgba(70, 130, 180, 1)' // Bleu acier plus visible
      };
    }

    // Calculer l'opacité basée sur l'intensité du contrôle avec une gamme élargie
    const maxControl = Math.max(control.whiteControl, control.blackControl);
    const opacity = Math.min(0.2 + (maxControl * 0.2), 1.0); // Opacité de 0.2 à 1.0 (gamme élargie)

    if (control.netControl > 0) {
      // Contrôle blanc dominant - couleur BLANCHE (au lieu d'orange-rouge)
      return {
        backgroundColor: `rgba(255, 255, 255, ${opacity})` // Blanc
      };
    } else if (control.netControl < 0) {
      // Contrôle noir dominant - couleur NOIRE (au lieu de bleu)
      return {
        backgroundColor: `rgba(0, 0, 0, ${opacity})` // Noir
      };
    } else if (control.whiteControl > 0 && control.blackControl > 0) {
      // Case contestée - ORANGE (au lieu de violet) avec gamme d'opacité élargie
      const totalControl = control.whiteControl + control.blackControl;
      const contestedOpacity = Math.min(0.3 + (totalControl * 0.15), 1.0); // Gamme élargie pour les contestées
      return {
        backgroundColor: `rgba(255, 165, 0, ${contestedOpacity})`, // Orange
        animation: 'pulse-heatmap 2s infinite'
      };
    }

    return {
      backgroundColor: 'rgba(70, 130, 180, 0.5)' // Fallback bleu plus visible
    };
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

  // === GESTION PGN ET NAVIGATION ===

  loadPgnIntoChess(chess: Chess, pgnText: string): boolean {
    try {
      // Réinitialiser l'échiquier
      chess.reset();

      // Nettoyer et corriger le PGN
      let cleanedPgn = this.cleanPgn(pgnText);

      // Charger le PGN
      chess.loadPgn(cleanedPgn);

      return true;
    } catch (error) {
      console.error('Erreur lors du chargement du PGN:', error);
      return false;
    }
  }

  private cleanPgn(pgnText: string): string {
    // Séparer les en-têtes des coups
    const lines = pgnText.split('\n');
    const headerLines: string[] = [];
    const moveLines: string[] = [];

    let inHeaders = true;

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine === '') {
        if (inHeaders) {
          inHeaders = false;
        }
        continue;
      }

      if (inHeaders && trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
        headerLines.push(trimmedLine);
      } else {
        inHeaders = false;
        if (trimmedLine) {
          moveLines.push(trimmedLine);
        }
      }
    }

    // Reconstruire la section des coups
    let movesText = moveLines.join(' ').trim();

    // Supprimer les doubles espaces
    movesText = movesText.replace(/\s+/g, ' ');

    // Corriger le premier coup s'il manque "1."
    if (movesText && !movesText.match(/^1\./)) {
      // Vérifier si ça commence par un coup (lettre minuscule ou majuscule)
      if (movesText.match(/^[a-zA-Z]/)) {
        movesText = '1. ' + movesText;
      }
    }

    // Reconstruire le PGN complet
    const result = [...headerLines, '', movesText].join('\n');

    console.log('PGN nettoyé:', result);
    return result;
  }

  getGameNavigation(chess: Chess): GameNavigation {
    const history = chess.history();
    const totalMoves = history.length;

    // Pour déterminer la position courante, on regarde l'historique
    const currentMove = totalMoves;

    return {
      currentMove,
      totalMoves,
      canGoBack: currentMove > 0,
      canGoForward: false // On est toujours à la fin après chargement
    };
  }

  goToMove(chess: Chess, moveNumber: number): boolean {
    try {
      const history = chess.history();
      const totalMoves = history.length;

      if (moveNumber < 0 || moveNumber > totalMoves) {
        return false;
      }

      // Sauvegarder le PGN complet
      const fullPgn = chess.pgn();

      // Réinitialiser et rejouer jusqu'au coup voulu
      chess.reset();

      if (moveNumber > 0) {
        // Rejouer les coups un par un jusqu'à la position désirée
        const moves = history.slice(0, moveNumber);
        chess.loadPgn(moves.map((move, index) => {
          const moveNum = Math.floor(index / 2) + 1;
          const isWhite = index % 2 === 0;
          return isWhite ? `${moveNum}. ${move}` : move;
        }).join(' '));
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la navigation:', error);
      return false;
    }
  }

  // === GESTION HISTORIQUE CENTRALISÉ ===

  /**
   * Crée un nouvel historique de jeu
   */
  createGameHistory(startingFen: string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'): GameHistory {
    return {
      moves: [],
      currentMoveIndex: -1, // Position initiale
      startingFen
    };
  }

  /**
   * Ajoute un coup à l'historique
   */
  addMoveToHistory(history: GameHistory, move: { san: string, from: string, to: string, fen: string }): GameHistory {
    const newMove: MoveHistoryEntry = {
      san: move.san,
      from: move.from,
      to: move.to,
      fen: move.fen,
      timestamp: Date.now()
    };

    // Si on n'est pas à la fin, on tronque l'historique (comme un vrai éditeur)
    const newMoves = history.moves.slice(0, history.currentMoveIndex + 1);
    newMoves.push(newMove);

    return {
      ...history,
      moves: newMoves,
      currentMoveIndex: newMoves.length - 1
    };
  }

  /**
   * Convertit un historique de coups simples en GameHistory
   */
  convertMovesToGameHistory(moves: any[], startingFen?: string): GameHistory {
    const history = this.createGameHistory(startingFen);

    // Créer un échiquier temporaire pour générer les FEN
    const tempChess = new Chess();
    if (startingFen) {
      tempChess.load(startingFen);
    }

    for (const move of moves) {
      try {
        // Faire le coup et capturer les informations
        const moveResult = tempChess.move(move.san || move);
        if (moveResult) {
          const newMove: MoveHistoryEntry = {
            san: moveResult.san,
            from: moveResult.from,
            to: moveResult.to,
            fen: tempChess.fen(),
            timestamp: move.timestamp || Date.now()
          };
          history.moves.push(newMove);
        }
      } catch (error) {
        console.warn('Erreur lors de la conversion du coup:', move, error);
      }
    }

    // Positionner à la fin
    history.currentMoveIndex = history.moves.length - 1;
    return history;
  }

  /**
   * Obtient la navigation pour un historique donné
   */
  getGameNavigationFromHistory(history: GameHistory): GameNavigation {
    return {
      currentMove: history.currentMoveIndex + 1, // +1 car -1 = position initiale = coup 0
      totalMoves: history.moves.length,
      canGoBack: history.currentMoveIndex >= 0,
      canGoForward: history.currentMoveIndex < history.moves.length - 1
    };
  }

  /**
   * Va au début de la partie
   */
  goToStartInHistory(chess: Chess, history: GameHistory): GameHistory {
    chess.load(history.startingFen);
    return {
      ...history,
      currentMoveIndex: -1
    };
  }

  /**
   * Va au coup précédent
   */
  goToPreviousInHistory(chess: Chess, history: GameHistory): GameHistory {
    if (history.currentMoveIndex < 0) {
      return history; // Déjà au début
    }

    const newIndex = history.currentMoveIndex - 1;

    if (newIndex < 0) {
      // Retour à la position initiale
      chess.load(history.startingFen);
    } else {
      // Aller à la position du coup précédent
      chess.load(history.moves[newIndex].fen);
    }

    return {
      ...history,
      currentMoveIndex: newIndex
    };
  }

  /**
   * Va au coup suivant
   */
  goToNextInHistory(chess: Chess, history: GameHistory): GameHistory {
    if (history.currentMoveIndex >= history.moves.length - 1) {
      return history; // Déjà à la fin
    }

    const newIndex = history.currentMoveIndex + 1;
    chess.load(history.moves[newIndex].fen);

    return {
      ...history,
      currentMoveIndex: newIndex
    };
  }

  /**
   * Va à la fin de la partie
   */
  goToEndInHistory(chess: Chess, history: GameHistory): GameHistory {
    if (history.moves.length === 0) {
      return history; // Pas de coups
    }

    const lastMove = history.moves[history.moves.length - 1];
    chess.load(lastMove.fen);

    return {
      ...history,
      currentMoveIndex: history.moves.length - 1
    };
  }

  /**
   * Va à un coup spécifique
   */
  goToMoveInHistory(chess: Chess, history: GameHistory, moveIndex: number): GameHistory {
    if (moveIndex < -1 || moveIndex >= history.moves.length) {
      return history; // Index invalide
    }

    if (moveIndex < 0) {
      // Position initiale
      chess.load(history.startingFen);
    } else {
      chess.load(history.moves[moveIndex].fen);
    }

    return {
      ...history,
      currentMoveIndex: moveIndex
    };
  }
}
