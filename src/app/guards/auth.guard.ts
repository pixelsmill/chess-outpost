import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { take, map } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    console.log('🔐 AuthGuard: Checking authentication for route:', state.url);

    return authService.user$.pipe(
        take(1),
        map(user => {
            const isAuthenticated = !!user;
            console.log('🔐 AuthGuard: User authentication status:', isAuthenticated);

            if (isAuthenticated) {
                return true;
            } else {
                console.log('🔐 AuthGuard: User not authenticated, redirecting to /play');
                router.navigate(['/play']);
                return false;
            }
        })
    );
}; 