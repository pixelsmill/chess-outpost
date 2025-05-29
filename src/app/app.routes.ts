import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PlayComponent } from './pages/play/play.component';
import { AnalyzeComponent } from './pages/analyze/analyze.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'play', component: PlayComponent },
    { path: 'analyze', component: AnalyzeComponent },
    { path: '**', redirectTo: '' } // Redirection pour les routes inconnues
];
