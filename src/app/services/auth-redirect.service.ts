import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, user } from '@angular/fire/auth';
import { filter, pairwise, startWith } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AuthRedirectService {
    private injector = inject(Injector);

    /**
     * Initialise la surveillance des changements d'état d'authentification
     * Redirige automatiquement vers l'accueil en cas de déconnexion sur une route protégée
     */
    initializeAuthRedirect() {
        // Capturer les dépendances dans le contexte d'injection sécurisé
        runInInjectionContext(this.injector, () => {
            const auth = inject(Auth);
            const router = inject(Router);

            user(auth).pipe(
                startWith(null),
                pairwise(),
                filter(([previousUser, currentUser]) => {
                    return previousUser !== null && currentUser === null;
                })
            ).subscribe(() => {
                // L'utilisateur vient de se déconnecter
                const currentUrl = router.url;
                const protectedRoutes = ['/play', '/analyze'];

                if (protectedRoutes.some(route => currentUrl.startsWith(route))) {
                    console.log('Déconnexion détectée sur route protégée, redirection vers l\'accueil');
                    router.navigate(['/']);
                }
            });
        });
    }
} 