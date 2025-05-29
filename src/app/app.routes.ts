import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PlayComponent } from './pages/play/play.component';
import { AnalyzeComponent } from './pages/analyze/analyze.component';
import { MultiplayerLobbyComponent } from './components/multiplayer-lobby/multiplayer-lobby.component';
import { MultiplayerGameComponent } from './components/multiplayer-game/multiplayer-game.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'play', component: PlayComponent, canActivate: [authGuard] },
    { path: 'analyze', component: AnalyzeComponent, canActivate: [authGuard] },
    { path: 'multiplayer', component: MultiplayerLobbyComponent, canActivate: [authGuard] },
    { path: 'play/multiplayer/:gameId', component: MultiplayerGameComponent, canActivate: [authGuard] },
    { path: '**', redirectTo: '' } // Redirection pour les routes inconnues
];
