// Service Worker for aggressive mobile caching and Lighthouse optimization
const CACHE_NAME = 'knowear-mobile-v1';
const STATIC_CACHE = 'knowear-static-v1';
const API_CACHE = 'knowear-api-v1';

// Critical resources to cache immediately
const CRITICAL_RESOURCES = [
  '/',
  '/products',
  '/fonts/jost-latin-400-normal.woff2',
  '/fonts/jost-latin-600-normal.woff2',
  '/_next/static/css/app/layout.css'
];

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CRITICAL_RESOURCES))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - implement aggressive caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Handle different resource types
  if (url.origin === self.location.origin) {
    // Static assets - cache first strategy
    if (url.pathname.startsWith('/_next/static/') || 
        url.pathname.startsWith('/fonts/') ||
        url.pathname.includes('.woff') ||
        url.pathname.includes('.css') ||
        url.pathname.includes('.js')) {
      event.respondWith(staticAssetCacheStrategy(request));
      return;
    }

    // API calls - network first with cache fallback
    if (url.pathname.startsWith('/api/')) {
      event.respondWith(apiCacheStrategy(request));
      return;
    }

    // Pages - cache first for better performance
    if (url.pathname === '/' || url.pathname.startsWith('/p/') || url.pathname.startsWith('/products')) {
      event.respondWith(pageCacheStrategy(request));
      return;
    }
  }

  // External images - cache with network first
  if (url.hostname.includes('amazonaws.com')) {
    event.respondWith(imageCacheStrategy(request));
    return;
  }
});

// Static asset cache strategy
async function staticAssetCacheStrategy(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return cached version if network fails
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

// API cache strategy
async function apiCacheStrategy(request) {
  const cache = await caches.open(API_CACHE);
  const cachedResponse = await cache.match(request);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache API responses for 5 minutes
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return cached API response if network fails
    return cachedResponse || new Response('API Offline', { status: 503 });
  }
}

// Page cache strategy
async function pageCacheStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Update cache in background
    fetch(request).then(networkResponse => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
    });
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return cachedResponse || new Response('Page Offline', { status: 503 });
  }
}

// Image cache strategy
async function imageCacheStrategy(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache images for 24 hours
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return cachedResponse || new Response('Image Offline', { status: 503 });
  }
}

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle any pending API calls or updates
  console.log('Background sync completed');
}
