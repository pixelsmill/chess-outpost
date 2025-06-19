import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { ShareHandlerService } from '../../services/share-handler.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['../../styles/shared-layout.scss', './home.component.scss']
})
export class HomeComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  user$: Observable<User | null> = this.authService.user$;

  isIOSDevice = signal(false);
  showInstallPrompt = signal(false);
  canInstall = signal(false);

  private deferredPrompt: any;

  constructor(private shareHandler: ShareHandlerService) { }

  ngOnInit() {
    // Détecter iOS
    this.isIOSDevice.set(this.shareHandler.isIOSDevice());

    // Gérer l'événement d'installation PWA
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.canInstall.set(true);
    });

    // Vérifier si l'app est déjà installée
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.showInstallPrompt.set(false);
    } else {
      this.showInstallPrompt.set(true);
    }
  }

  async installApp() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        this.canInstall.set(false);
        this.showInstallPrompt.set(false);
      }
      this.deferredPrompt = null;
    }
  }

  dismissInstallPrompt() {
    this.showInstallPrompt.set(false);
  }

  navigateToPlay() {
    this.router.navigate(['/play']);
  }

  navigateToAnalyze() {
    this.router.navigate(['/analyze']);
  }

  signInWithGoogle() {
    this.authService.loginWithGoogle();
  }
}
