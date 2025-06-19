// Nom du cache pour stocker les ressources
const CACHE_NAME = 'chess-outpost-v1';

// Liste des ressources à mettre en cache initialement
const INITIAL_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/assets/pieces/wk.png',
  '/assets/pieces/wq.png',
  '/assets/pieces/wr.png',
  '/assets/pieces/wb.png',
  '/assets/pieces/wn.png',
  '/assets/pieces/wp.png',
  '/assets/pieces/bk.png',
  '/assets/pieces/bq.png',
  '/assets/pieces/br.png',
  '/assets/pieces/bb.png',
  '/assets/pieces/bn.png',
  '/assets/pieces/bp.png',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
];

// Installer le service worker et mettre en cache les ressources initiales
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(INITIAL_RESOURCES);
      })
      .then(() => self.skipWaiting())
  );
});

// Activation : supprimer les anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Stratégie de cache : d'abord le réseau, puis le cache si hors ligne
self.addEventListener('fetch', (event) => {
  // Gérer spécialement les requêtes vers /analyze avec paramètres (partage iOS)
  if (event.request.url.includes('/analyze') && event.request.url.includes('?')) {
    // Laisser passer la requête normalement pour le partage iOS
    event.respondWith(fetch(event.request).catch(() => caches.match('/index.html')));
    return;
  }

  // Pour les requêtes d'API ou externes, toujours aller au réseau
  if (event.request.url.includes('/api/') || 
      !event.request.url.startsWith(self.location.origin)) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Pour le reste, essayer le réseau d'abord, puis le cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si succès, mettre en cache et retourner la réponse
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        // Si échec réseau, essayer le cache
        return caches.match(event.request).then(response => {
          // Si pas trouvé en cache et c'est une navigation, retourner index.html
          if (!response && event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return response;
        });
      })
  );
});

// Gérer les événements de partage (principalement pour Android/Chrome)
self.addEventListener('share_target', (event) => {
  event.respondWith((async () => {
    try {
      // Extraire les données partagées
      const formData = await event.request.formData();
      const text = formData.get('text') || '';
      const url = formData.get('url') || '';
      const title = formData.get('title') || '';

      // Rediriger vers la page d'analyse avec les données partagées
      let shareUrl = '/analyze';
      const params = new URLSearchParams();
      
      if (text) params.set('pgn', text);
      if (url) params.set('url', url);
      if (title) params.set('title', title);
      
      if (params.toString()) {
        shareUrl += '?' + params.toString();
      }

      return Response.redirect(shareUrl, 303);
    } catch (error) {
      console.error('Erreur dans share_target:', error);
      return Response.redirect('/analyze', 303);
    }
  })());
});

// Gérer les messages depuis l'app principale (communication bidirectionnelle)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHARE_DATA') {
    // Répondre avec confirmation
    event.ports[0].postMessage({ success: true });
  }
}); 