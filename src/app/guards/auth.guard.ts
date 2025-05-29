import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, user } from '@angular/fire/auth';
import { map, tap } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
    const auth = inject(Auth);
    const router = inject(Router);

    return user(auth).pipe(
        map(currentUser => {
            if (currentUser) {
                return true; // L'utilisateur est connecté, autoriser l'accès
            } else {
                // L'utilisateur n'est pas connecté, rediriger vers la page d'accueil
                console.log('Utilisateur non connecté, redirection vers la page d\'accueil');
                router.navigate(['/']);
                return false;
            }
        }),
        tap(isAuthenticated => {
            // Log pour debug
            if (!isAuthenticated) {
                console.log('Guard: Accès refusé, redirection en cours...');
            }
        })
    );
}; 