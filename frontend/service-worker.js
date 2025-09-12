/*
 * Service worker simple pour Citoyen‑AI.
 *
 * Ce script met en cache les ressources statiques essentielles afin que
 * l’interface puisse fonctionner hors‑ligne.  Lorsqu’une requête est effectuée,
 * le service worker renvoie d’abord la ressource du cache, puis tente de
 * l’actualiser en arrière‑plan.
 */

const CACHE_NAME = 'citizen-ai-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  // Note : le service worker se mettra en cache par lui‑même
];

self.addEventListener('install', (event) => {
  // Pré-cache des ressources de base
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  // Nettoyer d’anciennes versions du cache
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Ne pas intercepter les requêtes API (elles sont proxifiées par Nginx)
  if (event.request.url.includes('/chat')) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).then((fetchResponse) => {
          // Mettre à jour le cache en arrière‑plan
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        })
      );
    })
  );
});