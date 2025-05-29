import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { AuthService } from './services/auth.service';
import { AuthRedirectService } from './services/auth-redirect.service';
import { User } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, AuthComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'chessoutpost';
  private authService = inject(AuthService);
  private authRedirectService = inject(AuthRedirectService);

  // Observable de l'utilisateur pour la navigation conditionnelle
  user$: Observable<User | null> = this.authService.user$;

  ngOnInit() {
    // Initialise la surveillance des changements d'authentification
    this.authRedirectService.initializeAuthRedirect();
  }
}
