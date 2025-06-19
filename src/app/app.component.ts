import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AuthRedirectService } from './services/auth-redirect.service';
import { ShareHandlerService } from './services/share-handler.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'chessoutpost';
  private authRedirectService = inject(AuthRedirectService);
  private shareHandler = inject(ShareHandlerService);

  // État du menu mobile
  isMobileMenuOpen = false;

  ngOnInit() {
    // Initialise la surveillance des changements d'authentification
    this.authRedirectService.initializeAuthRedirect();

    // Gérer le partage entrant pour iOS
    this.handleIncomingShare();

    // Écouter les événements de focus pour gérer le retour à l'app
    window.addEventListener('focus', () => {
      this.handleIncomingShare();
    });
  }

  private handleIncomingShare() {
    // Vérifier si on est sur iOS et si l'URL contient des paramètres de partage
    if (this.shareHandler.isIOSDevice()) {
      const currentUrl = window.location.href;
      this.shareHandler.handleIncomingShare(currentUrl);
    }
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
