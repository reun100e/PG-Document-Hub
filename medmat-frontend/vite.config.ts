// medmat-frontend/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // or @vitejs/plugin-react-swc
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Files in `public` are automatically copied to `dist` root and usually don't need to be
      // listed in `includeAssets` unless you want them explicitly precached by the service worker.
      // `includeAssets` is more for assets that Vite might not pick up automatically for SW precaching.
      // Your main app assets (JS, CSS chunks) are precached by default.
      // For favicons and PWA icons, they are referenced in index.html or manifest.
      // If you want them to be available offline immediately (precached), include them.
      includeAssets: [
        'favicon.ico',
        'favicon.svg',
        'favicon-16x16.png',
        'favicon-32x32.png',
        'apple-touch-icon.png',
      ],
      manifest: {
        // These values will be used to generate dist/manifest.webmanifest
        name: 'PG Document Hub - WMHMC',
        short_name: 'PG Hub',
        description: 'Digital document management for the Dept. of Materia Medica, WMHMC.',
        theme_color: '#007A7A', // Match your primary theme color (Dark Teal)
        background_color: '#F8F9FA', // Match your light background color (Very Light Gray)
        display: 'standalone',
        scope: '/', // The scope of your PWA
        start_url: '/', // The page to open when the PWA is launched
        icons: [
          {
            src: '/android-chrome-192x192.png', // Path relative to public folder (will be /android... in dist)
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any', // Can be 'any', 'maskable', or 'any maskable'
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          }
        ],
        // Optional: screenshots, shortcuts, related_applications etc.
        // screenshots: [
        //   {
        //     "src": "/screenshot1.png",
        //     "sizes": "1280x720",
        //     "type": "image/png",
        //     "form_factor": "wide" // or "narrow"
        //   }
        // ],
        // shortcuts: [
        //   {
        //     "name": "Upload File",
        //     "short_name": "Upload",
        //     "description": "Quickly upload a new document",
        //     "url": "/upload",
        //     "icons": [{ "src": "/shortcut-upload-icon.png", "sizes": "96x96" }]
        //   }
        // ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'], // Files to precache


        navigateFallback: '/static/index.html', // Assuming your index.html is served via /static/ by Django
        navigateFallbackDenylist: [
          /^\/admin/,      // Exclude Django admin paths
          /^\/api/,        // Exclude API paths
          /^\/media/,      // Exclude media file paths
          // Add any other backend-specific paths
          new RegExp('/[^/?]+\\.[^/?]+$'), // Common regex to exclude direct file requests
        ],

        // runtimeCaching: [ // Example API caching (adjust urlPattern)
        //   {
        //     urlPattern: ({ url }) => url.pathname.startsWith('/api'), // Cache API calls
        //     handler: 'NetworkFirst', // Or 'StaleWhileRevalidate'
        //     options: {
        //       cacheName: 'api-cache',
        //       expiration: {
        //         maxEntries: 50,
        //         maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
        //       },
        //       cacheableResponse: {
        //         statuses: [0, 200],
        //       },
        //     },
        //   },
        // ],
      },
    }),
  ],
  // CRITICAL for deployment with Django/WhiteNoise if STATIC_URL is /static/
  base: '/static/',
  build: {
    manifest: true, // Generates manifest.json (asset manifest, not PWA manifest) for server integration
    outDir: 'dist',
    assetsDir: 'assets', // Default, where JS/CSS chunks go (e.g., dist/assets/index-XXXX.js)
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/media': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      }
    }
  }
})