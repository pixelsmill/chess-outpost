import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  user$: Observable<User | null> = this.authService.user$;

  navigateToMultiplayer() {
    this.router.navigate(['/multiplayer']);
  }

  navigateToAnalyze() {
    this.router.navigate(['/analyze']);
  }

  showLoginPrompt() {
    alert('Connectez-vous avec Google dans la barre de navigation pour accéder au mode multijoueur.');
  }

  handleMultiplayerClick() {
    this.user$.subscribe(user => {
      if (user) {
        this.navigateToMultiplayer();
      } else {
        this.showLoginPrompt();
      }
    });
  }
}
