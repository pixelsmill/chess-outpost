import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { User } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-auth',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
    private authService = inject(AuthService);

    // Observable de l'utilisateur connecté
    user$: Observable<User | null> = this.authService.user$;

    // État de chargement
    isLoading = false;
    errorMessage = '';

    /**
     * Gérer la connexion avec Google
     */
    async onGoogleLogin(): Promise<void> {
        this.isLoading = true;
        this.errorMessage = '';

        try {
            await this.authService.loginWithGoogle();
        } catch (error: any) {
            // Afficher un message d'erreur convivial
            this.errorMessage = 'Erreur lors de la connexion. Veuillez réessayer.';
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Gérer la déconnexion
     */
    async onLogout(): Promise<void> {
        this.isLoading = true;
        this.errorMessage = '';

        try {
            await this.authService.logout();
        } catch (error: any) {
            this.errorMessage = 'Erreur lors de la déconnexion. Veuillez réessayer.';
        } finally {
            this.isLoading = false;
        }
    }
} 