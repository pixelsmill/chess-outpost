import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class ShareHandlerService {
    constructor(private router: Router) { }

    /**
     * Vérifie si le navigateur supporte le Web Share Target API
     */
    isWebShareTargetSupported(): boolean {
        return 'serviceWorker' in navigator && 'share_target' in navigator;
    }

    /**
     * Vérifie si on est sur iOS/Safari
     */
    isIOSDevice(): boolean {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    }

    /**
     * Gère le partage entrant pour iOS
     * Cette méthode sera appelée quand l'app est ouverte via une URL de partage
     */
    handleIncomingShare(url: string): boolean {
        try {
            const urlObj = new URL(url, window.location.origin);

            // Vérifier si c'est une URL de partage vers /analyze
            if (urlObj.pathname === '/analyze' && urlObj.searchParams.size > 0) {
                const params: any = {};

                // Extraire les paramètres
                for (const [key, value] of urlObj.searchParams) {
                    params[key] = value;
                }

                // Naviguer vers la page d'analyse avec les paramètres
                this.router.navigate(['/analyze'], { queryParams: params });
                return true;
            }

            return false;
        } catch (error) {
            console.error('Erreur lors du traitement du partage:', error);
            return false;
        }
    }

    /**
     * Crée une URL de partage pour iOS
     */
    createShareUrl(data: { title?: string; text?: string; url?: string }): string {
        const params = new URLSearchParams();

        if (data.title) params.set('title', data.title);
        if (data.text) params.set('pgn', data.text);
        if (data.url) params.set('url', data.url);

        return `${window.location.origin}/analyze?${params.toString()}`;
    }

    /**
     * Partage du contenu (si supporté par le navigateur)
     */
    async shareContent(data: { title?: string; text?: string; url?: string }): Promise<boolean> {
        if (navigator.share) {
            try {
                await navigator.share(data);
                return true;
            } catch (error) {
                console.error('Erreur lors du partage:', error);
                return false;
            }
        }
        return false;
    }

    /**
     * Copie l'URL de partage dans le presse-papiers
     */
    async copyShareUrl(data: { title?: string; text?: string; url?: string }): Promise<boolean> {
        try {
            const shareUrl = this.createShareUrl(data);
            await navigator.clipboard.writeText(shareUrl);
            return true;
        } catch (error) {
            console.error('Erreur lors de la copie:', error);
            return false;
        }
    }
} 