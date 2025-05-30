import { Injectable, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, user, User } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private auth: Auth = inject(Auth);
    private router: Router = inject(Router);
    private googleProvider = new GoogleAuthProvider();

    // Observable de l'état de l'utilisateur
    user$: Observable<User | null> = user(this.auth);

    constructor() {
        // Optionnel : configurer des scopes supplémentaires pour Google
        this.googleProvider.addScope('profile');
        this.googleProvider.addScope('email');
    }

    /**
     * Connexion avec Google
     */
    async loginWithGoogle(): Promise<void> {
        try {
            const result = await signInWithPopup(this.auth, this.googleProvider);
            const user = result.user;
            console.log('Connexion Google réussie pour:', user.displayName);

            // Rediriger vers la page d'accueil ou une autre page après connexion
            // this.router.navigate(['/dashboard']);

        } catch (error: any) {
            console.error('Erreur lors de la connexion Google:', error);

            const errorCode = error.code;
            const errorMessage = error.message;

            // Gérer différents types d'erreurs
            switch (errorCode) {
                case 'auth/popup-closed-by-user':
                    console.log('Popup de connexion Google fermée par l\'utilisateur.');
                    break;
                case 'auth/popup-blocked':
                    console.log('Popup bloquée par le navigateur.');
                    break;
                case 'auth/cancelled-popup-request':
                    console.log('Demande de popup annulée.');
                    break;
                default:
                    console.error('Erreur d\'authentification:', errorMessage);
            }

            throw error; // Re-lancer l'erreur pour que le composant puisse la gérer
        }
    }

    /**
     * Déconnexion
     */
    async logout(): Promise<void> {
        try {
            const currentUser = this.auth.currentUser;
            await signOut(this.auth);
            console.log('Déconnexion réussie pour:', currentUser?.displayName);

            // Rafraîchir la page au lieu de rediriger
            window.location.reload();

        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
            throw error;
        }
    }

    /**
     * Obtenir l'utilisateur actuel
     */
    getCurrentUser(): User | null {
        return this.auth.currentUser;
    }

    /**
     * Vérifier si l'utilisateur est connecté
     */
    isLoggedIn(): boolean {
        return this.auth.currentUser !== null;
    }
} 