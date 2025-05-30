import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AnalyzeComponent } from './pages/analyze/analyze.component';
import { PlayComponent } from './pages/play/play.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'analyze', component: AnalyzeComponent },
    {
        path: 'play',
        component: PlayComponent,
        children: [
            { path: '', component: PlayComponent }, // Lobby par défaut
            { path: 'game/:gameId', component: PlayComponent, canActivate: [authGuard] } // Game spécifique
        ]
    },
    { path: '**', redirectTo: '' } // Redirection pour les routes inconnues
];
