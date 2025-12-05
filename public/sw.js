// public/sw.js - Enhanced Service Worker for PWA functionality

const CACHE_NAME = 'pdf-tools-v1.2.0';
const STATIC_CACHE = 'pdf-tools-static-v1.2.0';
const DYNAMIC_CACHE = 'pdf-tools-dynamic-v1.2.0';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/offline.html'
];

// PDF processing tools to cache
const TOOL_PAGES = [
  "/pdf/merge",
  "/pdf/split",
  "/pdf/compress",
  "/jpg-to-pdf",
  "/pdf-to-jpg",
  "/mp4-to-mp3",
  "/zip-extractor",
  "/csv-json-converter",
  "/text-case-converter",
  "/url-encoder",
  "/base64-encoder",
  "/html-markdown-converter",
  "/json-xml-converter",
  "/text-diff-checker",
  "/regex-tester",
  "/uuid-generator",
  "/hash-generator",
  "/txt-to-pdf",
  "/heic-to-jpg",
  "/docx-to-pdf",
  "/docx-to-text",
  "/pdf-to-docx",
  "/pdf-to-html",
  "/pdf-to-ppt",
  "/pdf-to-xlsx",
  "/resize-images",
  "/compress-images",
  "/voice-changer",
  "/audio-speed-changer",
  "/remove-silence",
  "/audio-compressor",
  "/m4a-mp3-converter",
  "/wav-mp3-converter",
  "/remove-audio",
  "/extract-audio",
  "/avi-mkv-to-mp4",
  "/svg-to-png",
  "/bmp-tiff-converter",
  "/image-converter",
  "/zip-creator",
  "/tar-extractor",
  "/video-to-gif",
  "/webm-to-mp4",
  "/video-compress",
  "/video-trim",
  "/html-to-pdf",
  "/markdown-to-html",
  "/rotate",
  "/watermark",
  "/protect",
  "/unlock",
  "/delete-pages",
  "/reorder",
  "/organize",
  "/page-numbers",
  "/password-strength",
  "/ocr",
  "/pdf-to-text",
  "/sign",
  "/form-filler",
  "/legal-analyzer",
  "/medical-analyzer",
  "/pdf-metadata-editor",
  "/pdf-bookmark-manager",
  "/pdf-table-extractor",
  "/pdf-batch-processor",
  "/pdf-form-creator",
  "/advanced-ocr",
  "/pdf-accessibility-checker",
  "/pdf-digital-signature",
  "/pdf-redaction",
  "/pdf-version-comparison",
  "/pdf-annotation-collaboration",
  "/invoice-generator",
  "/qr-generator",
  "/qr-scanner",
  "/barcode-generator",
  "/certificate-generator",
  "/portfolio-creator",
  "/report-generator",
  "/xlsx-to-csv",
  "/csv-to-xlsx",
  "/metadata-extractor",
  "/html-minifier",
  "/css-minifier",
  "/js-minifier",
  "/aes-encrypt",
  "/rsa-generator",
  "/jwt-decoder",
  "/markdown-previewer",
  "/number-base-converter",
  "/unit-converter",
  "/currency-converter",
  "/timezone-converter",
  "/color-converter",
  "/url-shortener",
  "/steganography",
  "/image-filters",
  "/image-text-overlay",
  "/image-drawing",
  "/image-watermark",
  "/remove-background",
  "/face-blur",
  "/image-crop",
  "/image-cropper",
  "/image-rotator",
  "/file-checksum",
  "/ppt-to-pdf",
  "/about",
  "/tools",
  "/security",
  "/sponsors"
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(DYNAMIC_CACHE).then((cache) => {
        console.log('Service Worker: Caching tool pages');
        return cache.addAll(TOOL_PAGES);
      })
    ]).then(() => {
      console.log('Service Worker: Installation complete');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE && 
              cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/_next/static/')) {
    // Static assets - cache first
    event.respondWith(cacheFirst(request));
  } else if (TOOL_PAGES.includes(url.pathname) || url.pathname === '/') {
    // Tool pages and homepage - network first with cache fallback
    event.respondWith(networkFirst(request));
  } else if (url.pathname.startsWith('/api/')) {
    // API requests - network only
    event.respondWith(fetch(request));
  } else {
    // Other requests - cache first with network fallback
    event.respondWith(cacheFirst(request));
  }
});

// Cache first strategy
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    return new Response('Offline content not available', { status: 503 });
  }
}

// Network first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlineResponse = await caches.match('/offline.html');
      if (offlineResponse) {
        return offlineResponse;
      }
    }
    
    return new Response('Offline and no cached content available', { status: 503 });
  }
}

// Background sync for file processing
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-process') {
    event.waitUntil(processQueuedFiles());
  }
});

async function processQueuedFiles() {
  // Handle queued file processing when back online
  console.log('Processing queued files...');
  // Implementation would depend on your specific needs
}

// Push notifications (for future premium features)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: data.data,
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action) {
    // Handle action button clicks
    console.log('Notification action clicked:', event.action);
  } else {
    // Handle notification click
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/')
    );
  }
});

// Share target handling
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  if (url.pathname === '/' && event.request.method === 'POST') {
    event.respondWith(handleShareTarget(event.request));
  }
});

async function handleShareTarget(request) {
  const formData = await request.formData();
  const files = formData.getAll('files');
  
  if (files && files.length > 0) {
    // Store shared files for processing
    const fileData = await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        type: file.type,
        data: await file.arrayBuffer()
      }))
    );
    
    // Store in IndexedDB or handle as needed
    console.log('Shared files received:', fileData);
    
    // Redirect to appropriate tool
    return Response.redirect('/?shared=true', 303);
  }
  
  return Response.redirect('/', 303);
}

// Periodic background sync for analytics
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'analytics-sync') {
    event.waitUntil(syncAnalytics());
  }
});

async function syncAnalytics() {
  // Sync offline analytics data when online
  console.log('Syncing analytics data...');
}