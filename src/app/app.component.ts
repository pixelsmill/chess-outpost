import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthRedirectService } from './services/auth-redirect.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'chessoutpost';
  private authRedirectService = inject(AuthRedirectService);

  // État du menu mobile
  isMobileMenuOpen = false;

  ngOnInit() {
    // Initialise la surveillance des changements d'authentification
    this.authRedirectService.initializeAuthRedirect();
  }

  // Basculer l'état du menu mobile
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  // Fermer le menu mobile (utile quand on clique sur un lien)
  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }
}
