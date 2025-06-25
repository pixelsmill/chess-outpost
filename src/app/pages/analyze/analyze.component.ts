import { Component, OnInit, ViewChild, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ChessBoardWithControlsComponent } from '../../shared/chess-board-with-controls/chess-board-with-controls.component';
import { ChessService } from '../../services/chess.service';
import { GameNavigationService } from '../../services/game-navigation.service';
import { BoardDisplayService, BackgroundType } from '../../services/board-display.service';
import { PositionEvaluatorService, PositionEvaluation } from '../../services/position-evaluator.service';
import { PositionAdviceService, PositionAdvantage, AdviceResult } from '../../services/position-advice.service';
import { Chess } from 'chess.js';

type AnalysisMode = 'free' | 'pgn';

// Interface pour les métadonnées PGN
export interface PgnMetadata {
  Event?: string;
  Site?: string;
  Date?: string;
  Round?: string;
  White?: string;
  Black?: string;
  Result?: string;
  WhiteElo?: string;
  BlackElo?: string;
  TimeControl?: string;
  Termination?: string;
  ECO?: string;
  Tournament?: string;
  [key: string]: string | undefined; // Pour les autres headers non-standard
}

@Component({
  selector: 'app-analyze',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ChessBoardWithControlsComponent
  ],
  templateUrl: './analyze.component.html',
  styleUrls: ['../../styles/shared-layout.scss', './analyze.component.scss']
})
export class AnalyzeComponent implements OnInit {
  @ViewChild('chessBoardWithControls') chessBoardWithControls!: ChessBoardWithControlsComponent;

  // Signal pour le mode d'analyse (libre ou PGN)
  analysisMode = signal<AnalysisMode>('free');

  // Gestion PGN (mode PGN seulement)
  pgnText = '';
  isNavigationMode = signal(false);
  pgnMetadata = signal<PgnMetadata | null>(null);

  // Instance Chess locale pour le chargement PGN et le mode libre
  private localChess = new Chess();

  // Évaluation de la position actuelle
  currentEvaluation = signal<PositionEvaluation | null>(null);
  currentAdvantages = signal<PositionAdvantage[]>([]);

  // État de l'onglet sélectionné pour le conseil stratégique
  selectedColorTab = signal<'white' | 'black'>('white');

  // Signaux pour les conseils et avantages par couleur
  whiteAdvice = signal<string>('');
  blackAdvice = signal<string>('');
  whiteAdvantages = signal<string>('');
  blackAdvantages = signal<string>('');

  // Computed properties
  isFreeMoveEnabled = computed(() => this.analysisMode() === 'free');
  isPgnMode = computed(() => this.analysisMode() === 'pgn');

  constructor(
    private chessService: ChessService,
    public boardDisplay: BoardDisplayService,
    public gameNavigationService: GameNavigationService,
    private route: ActivatedRoute,
    private positionEvaluator: PositionEvaluatorService,
    private positionAdvice: PositionAdviceService
  ) {
    effect(() => {
      const currentPosition = this.gameNavigationService.currentPosition();
      if (currentPosition) {
        this.updatePositionEvaluation(currentPosition);
      }
    });
  }

  // === GESTION DES ONGLETS DE COULEUR ===

  setSelectedColorTab(color: 'white' | 'black'): void {
    this.selectedColorTab.set(color);
  }

  /**
   * Bascule l'orientation de l'échiquier via le BoardDisplayService
   */
  flipBoard(): void {
    this.boardDisplay.flipBoardOrientation();
  }

  getAdviceForSelectedColor(): string {
    const advice = this.selectedColorTab() === 'white' ? this.whiteAdvice() : this.blackAdvice();
    return advice || ''; // Retourne une chaîne vide si pas de conseil
  }

  getAdviceKeyForSelectedColor(): string {
    const avantages = [
      this.whiteAdvantages().split(', ').filter(a => a.trim() !== ''),
      this.blackAdvantages().split(', ').filter(a => a.trim() !== '')
    ]

    if (this.selectedColorTab() === 'black') {
      avantages.reverse();
    }

    // Les deux ont des avantages : mes_avantages_vs_leurs_avantages
    return `${avantages[0].join('_')}_vs_${avantages[1].join('_')}`;
  }

  // === GESTION DES ONGLETS DU BILAN STRATÉGIQUE ===

  // Méthodes pour les avantages par couleur (bilan stratégique)
  getWhiteAdvantageTagsList(): string[] {
    const advantages = this.whiteAdvantages();
    return advantages ? this.getAdvantagesList(advantages) : [];
  }

  getBlackAdvantageTagsList(): string[] {
    const advantages = this.blackAdvantages();
    return advantages ? this.getAdvantagesList(advantages) : [];
  }

  private getAdvantagesList(advantages: string): string[] {
    return advantages.split(', ').filter(advantage => advantage.trim() !== '');
  }

  getDisplayName(factor: string): string {
    const displayNames: { [key: string]: string } = {
      'kingSafety': "Sécurité du roi",
      'materialBalance': "Avantage matériel",
      'pieceActivity': "Activité des pièces",
      'spaceControl': "Contrôle de l'espace",
      'pawnStructure': "Structure de pions"
    };
    return displayNames[factor] || factor;
  }

  /**
   * Traduit le TimeControl en format lisible
   */
  getReadableTimeControl(timeControl: string): string {
    if (!timeControl) return timeControl;

    // Format Chess.com daily : "1/86400" = 1 jour par coup
    if (timeControl === '1/86400') {
      return '1 jour par coup';
    }

    // Autres formats daily courants
    if (timeControl === '3/86400') {
      return '3 jours par coup';
    }
    if (timeControl === '7/86400') {
      return '7 jours par coup';
    }
    if (timeControl === '14/86400') {
      return '14 jours par coup';
    }

    // Format standard : "600+5" = 10min + 5sec par coup
    const standardMatch = timeControl.match(/^(\d+)\+(\d+)$/);
    if (standardMatch) {
      const baseTime = parseInt(standardMatch[1]);
      const increment = parseInt(standardMatch[2]);

      if (baseTime >= 60) {
        const minutes = Math.floor(baseTime / 60);
        return `${minutes}min + ${increment}sec`;
      } else {
        return `${baseTime}sec + ${increment}sec`;
      }
    }

    // Format simple : "180" = 3 minutes
    const simpleMatch = timeControl.match(/^(\d+)$/);
    if (simpleMatch) {
      const seconds = parseInt(simpleMatch[1]);
      if (seconds >= 60) {
        const minutes = Math.floor(seconds / 60);
        return `${minutes}min`;
      } else {
        return `${seconds}sec`;
      }
    }

    // Si aucun format reconnu, retourner tel quel
    return timeControl;
  }

  /**
   * Convertit un nom d'affichage vers sa clé technique
   */
  private getKeyFromDisplayName(displayName: string): string {
    const reverseMapping: { [key: string]: string } = {
      "Sécurité du roi": "kingSafety",
      "Avantage matériel": "materialBalance",
      "Activité des pièces": "pieceActivity",
      "Contrôle de l'espace": "spaceControl",
      "Structure de pions": "pawnStructure"
    };
    return reverseMapping[displayName] || '';
  }

  /**
   * Génère une clé situationnelle pour une couleur spécifique
   */
  getAdviceKeyForColor(color: 'white' | 'black'): string {
    const whiteAdvs = this.whiteAdvantages().split(', ').filter(a => a.trim() !== '');
    const blackAdvs = this.blackAdvantages().split(', ').filter(a => a.trim() !== '');

    // Convertir les noms d'affichage vers les clés techniques
    const whiteKeys = whiteAdvs.map(adv => this.getKeyFromDisplayName(adv)).filter(key => key !== '');
    const blackKeys = blackAdvs.map(adv => this.getKeyFromDisplayName(adv)).filter(key => key !== '');

    // IMPORTANT: Respecter l'ordre EVALUATION_ORDER pour la cohérence avec PositionAdviceService
    const evaluationOrder = [
      'materialBalance',
      'spaceControl',
      'pieceActivity',
      'kingSafety',
      'pawnStructure'
    ];

    // Trier les clés selon l'ordre d'évaluation
    const whiteKeysOrdered = evaluationOrder.filter(key => whiteKeys.includes(key));
    const blackKeysOrdered = evaluationOrder.filter(key => blackKeys.includes(key));

    const avantages = [whiteKeysOrdered, blackKeysOrdered];

    if (color === 'black') {
      avantages.reverse();
    }

    // Format toujours : mesAvantages_vs_leursAvantages
    return `${avantages[0].join('_')}_vs_${avantages[1].join('_')}`;
  }

  // === RESTE DU CODE ===

  ngOnInit(): void {
    // Initialiser l'historique vide pour le mode libre
    this.gameNavigationService.initializeHistory();

    // En mode analyze, toujours utiliser un override d'orientation (créer un si n'existe pas)
    if (!this.boardDisplay.hasOrientationOverride()) {
      this.boardDisplay.setOrientationOverride('white');
    }

    // Vérifier si un PGN a été partagé via l'API Web Share Target
    this.route.queryParams.subscribe(params => {
      // La propriété 'pgn' correspond au paramètre 'text' dans le share_target du manifest
      if (params['pgn']) {
        this.pgnText = params['pgn'];
        this.setAnalysisMode('pgn');
        this.loadPgn();
      } else if (params['url']) {
        // Si un URL est partagé, essayer de l'analyser pour voir si c'est un lien vers une partie
        this.fetchPgnFromUrl(params['url']);
      } else {
        // Pré-remplir avec la partie Immortelle
        this.pgnText = `[Event "London 'Immortal game'"]
[Site "London"]
[Date "1851.06.21"]
[Round "?"]
[White "Anderssen, Adolf"]
[Black "Kieseritzky, Lionel Adalbert BF"]
[Result "1-0"]
[ECO "C33"]
[PlyCount "45"]
[EventDate "1851.06.21"]
[EventType "game"]
[EventRounds "1"]
[EventCountry "ENG"]
[Source "ChessBase"]
[SourceDate "1999.07.01"]

e4 e5 2. f4 exf4 3. Bc4 Qh4+ 4. Kf1 b5 5. Bxb5 Nf6 6. Nf3 Qh6 7. d3 Nh5 8.
Nh4 Qg5 9. Nf5 c6 10. g4 Nf6 11. Rg1 cxb5 12. h4 Qg6 13. h5 Qg5 14. Qf3 Ng8 15.
Bxf4 Qf6 16. Nc3 Bc5 17. Nd5 Qxb2 18. Bd6 Bxg1 19. e5 Qxa1+ 20. Ke2 Na6 21.
Nxg7+ Kd8 22. Qf6+ Nxf6 23. Be7# 1-0`;
      }
    });
  }

  // Méthode pour récupérer le PGN à partir d'une URL partagée
  private fetchPgnFromUrl(url: string): void {
    // Tenter de détecter si l'URL est une partie Chess.com
    if (url.includes('chess.com/game/live') || url.includes('chess.com/game/daily')) {
      // Pour le moment, informer l'utilisateur que la fonctionnalité est en développement
      console.log('URL de partie Chess.com détectée:', url);
      // Note: Pour une implémentation complète, vous auriez besoin d'un service backend
      // pour récupérer le PGN à partir de l'API Chess.com, car CORS empêcherait
      // les appels directs depuis le navigateur
    }
  }

  // === GESTION DES MODES ===

  setAnalysisMode(mode: AnalysisMode): void {
    this.analysisMode.set(mode);

    if (mode === 'free') {
      // Retour au mode libre : reset position et historique
      this.isNavigationMode.set(false);
      this.resetToStartingPosition();
    }
    // Pour le mode PGN, on laisse l'interface de chargement apparaître
  }

  private resetToStartingPosition(): void {
    this.localChess.reset();
    this.gameNavigationService.reset();
  }

  // === PROPRIÉTÉS POUR LE MODE LIBRE ===

  get gameStatus(): string {
    if (!this.isFreeMoveEnabled()) return '';
    return this.chessBoardWithControls?.gameStatus || '';
  }

  get isGameOver(): boolean {
    if (!this.isFreeMoveEnabled()) return false;
    return this.chessBoardWithControls?.isGameOver || false;
  }

  get isCheck(): boolean {
    if (!this.isFreeMoveEnabled()) return false;
    return this.chessBoardWithControls?.isCheck || false;
  }

  resetGame(): void {
    if (!this.isFreeMoveEnabled()) return;
    if (this.chessBoardWithControls) {
      this.chessBoardWithControls.resetGame();
    }
    // Réinitialiser l'historique centralisé
    this.resetToStartingPosition();
  }

  // === PROPRIÉTÉS POUR LA NAVIGATION (UNIFIÉES) ===

  get canGoBack(): boolean {
    return this.gameNavigationService.canGoBack();
  }

  get canGoForward(): boolean {
    return this.gameNavigationService.canGoForward();
  }

  get canNavigate(): boolean {
    return this.gameNavigationService.canNavigate();
  }

  get currentPosition(): string {
    return this.gameNavigationService.currentPosition();
  }

  // === GESTION DES COUPS (MODE LIBRE) ===

  onMoveChange(move: { from: string; to: string; promotion?: string }): void {
    if (!this.isFreeMoveEnabled() || this.gameNavigationService.isCurrentlyNavigating()) return;

    const currentPosition = this.gameNavigationService.currentPosition();
    this.localChess.load(currentPosition);

    try {
      const moveResult = this.localChess.move(move);
      if (moveResult) {
        this.gameNavigationService.addMove({
          san: moveResult.san,
          from: moveResult.from,
          to: moveResult.to,
          fen: this.localChess.fen()
        });
      }
    } catch (error) {
      console.error('Error adding move to history:', error);
    }
  }

  // === GESTION COMMUNE ===

  onPositionChange(newPosition: string): void {
    if ((this.isPgnMode() && this.isNavigationMode()) || this.gameNavigationService.isCurrentlyNavigating()) {
      return;
    }
  }

  // === GESTION PGN ===

  loadPgn(): void {
    if (!this.pgnText.trim()) {
      alert('Please enter a valid PGN');
      return;
    }

    const result = this.chessService.loadPgnIntoChess(this.localChess, this.pgnText);

    if (result.success) {
      // Stocker les métadonnées
      this.pgnMetadata.set(result.metadata);

      // Convertir l'historique PGN en GameHistory centralisé via le service
      const moves = this.localChess.history();
      const pgnMoves = moves.map(san => ({ san }));
      this.gameNavigationService.loadFromMoves(pgnMoves);

      this.goToStart();
      this.isNavigationMode.set(true);
    } else {
      alert('Error loading PGN. Please check the format.');
    }
  }

  newPgnAnalysis(): void {
    this.pgnText = '';
    this.pgnMetadata.set(null);
    this.isNavigationMode.set(false);
    this.resetToStartingPosition();
  }

  // === NAVIGATION UNIFIÉE (PGN ET MODE LIBRE) ===

  goToStart(): void {
    this.gameNavigationService.goToStart();
  }

  goToPrevious(): void {
    this.gameNavigationService.goToPrevious();
  }

  goToNext(): void {
    this.gameNavigationService.goToNext();
  }

  goToEnd(): void {
    this.gameNavigationService.goToEnd();
  }

  getCurrentMoveDisplay(): string {
    const currentMove = this.gameNavigationService.currentMove();
    const totalMoves = this.gameNavigationService.totalMoves();

    if (currentMove === 0) {
      return "Position initiale";
    }

    // Calculer le numéro de coup en notation échiquéenne
    const moveNumber = Math.ceil(currentMove / 2);
    const totalFullMoves = Math.ceil(totalMoves / 2);

    // Déterminer la couleur qui vient de jouer
    const isWhiteMove = (currentMove % 2) === 1;
    const colorPlayed = isWhiteMove ? "Blancs" : "Noirs";

    return `${moveNumber}/${totalFullMoves}. ${colorPlayed}`;
  }

  get currentMove(): number {
    return this.gameNavigationService.currentMove();
  }

  get totalMoves(): number {
    return this.gameNavigationService.totalMoves();
  }

  /**
   * Met à jour l'évaluation de la position - VERSION SIMPLIFIÉE
   */
  private updatePositionEvaluation(position: string): void {
    try {
      const evaluation = this.positionEvaluator.evaluatePosition(position);
      console.log('Évaluation de la position:', evaluation);
      this.currentEvaluation.set(evaluation);

      // Récupérer les avantages directement de l'évaluation (pas d'ajustement)
      const adviceResult = this.positionAdvice.getPositionAdviceWithDebug(evaluation);
      console.log('Résultat des conseils:', adviceResult);

      // Définir les avantages pour chaque couleur
      const whiteAdvantagesList = adviceResult.whiteAdvantages.map(adv => this.getDisplayName(adv));
      const blackAdvantagesList = adviceResult.blackAdvantages.map(adv => this.getDisplayName(adv));

      this.whiteAdvantages.set(whiteAdvantagesList.join(', '));
      this.blackAdvantages.set(blackAdvantagesList.join(', '));

      // Générer les conseils spécifiques pour chaque couleur avec les clés 
      const whiteKey = this.getAdviceKeyForColor('white');
      const blackKey = this.getAdviceKeyForColor('black');

      console.log('Clé pour les blancs:', whiteKey);
      console.log('Clé pour les noirs:', blackKey);

      const whiteAdvice = this.positionAdvice.getAdviceByKey(whiteKey);
      const blackAdvice = this.positionAdvice.getAdviceByKey(blackKey);

      // Formatter les conseils pour l'affichage
      const whiteFullAdvice = whiteAdvice && whiteAdvice.diagnosis && whiteAdvice.prescription
        ? `${whiteAdvice.diagnosis} : ${whiteAdvice.prescription}`
        : whiteAdvice?.diagnosis || whiteAdvice?.prescription || '';

      const blackFullAdvice = blackAdvice && blackAdvice.diagnosis && blackAdvice.prescription
        ? `${blackAdvice.diagnosis} : ${blackAdvice.prescription}`
        : blackAdvice?.diagnosis || blackAdvice?.prescription || '';

      this.whiteAdvice.set(whiteFullAdvice);
      this.blackAdvice.set(blackFullAdvice);

      this.currentAdvantages.set(this.positionAdvice.getPositionAdvantages(evaluation));

    } catch (error) {
      console.error('Error evaluating position:', error);
      this.currentEvaluation.set(null);
      this.currentAdvantages.set([]);
      this.whiteAdvice.set('');
      this.blackAdvice.set('');
    }
  }
}
