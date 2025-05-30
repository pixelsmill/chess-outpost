import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AnalyzeComponent } from './pages/analyze/analyze.component';
import { MultiplayerLobbyComponent } from './components/multiplayer-lobby/multiplayer-lobby.component';
import { MultiplayerGameComponent } from './components/multiplayer-game/multiplayer-game.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'analyze', component: AnalyzeComponent },
    { path: 'play', component: MultiplayerLobbyComponent },
    { path: 'play/multiplayer/:gameId', component: MultiplayerGameComponent, canActivate: [authGuard] },
    { path: '**', redirectTo: '' } // Redirection pour les routes inconnues
];
