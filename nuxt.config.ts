// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  // https://nuxt.com/docs/getting-started/upgrade#testing-nuxt-4
  future: { compatibilityVersion: 4 },

  app: {
    head: {
      link: [
        { rel: 'stylesheet', href: 'https://fonts.cdnfonts.com/css/komika' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap' }
      ]
    }
  },

  // https://nuxt.com/modules
  modules: [
    '@nuxthub/core',
    '@pinia/nuxt',
    'nuxt-feather-icons',
    '@nuxt/ui',
    '@nuxt/image',
    'nuxt-auth-utils',
    '@vueuse/nuxt',
    '@nuxt/eslint',
    '@vite-pwa/nuxt',
  ],
  eslint: {
    config: {
      stylistic: true,
    },
  },
  hub: {
    database: true,
    blob: true,
  },
  nitro: {
    preset: 'cloudflare-pages',
    cloudflare: {
      compatibilityDate: '2024-11-01',
      compatibilityFlags: ['nodejs_compat'],
    },
  },
  colorMode: {
    preference: 'system', // default value of $colorMode.preference
    fallback: 'light', // fallback value if not system preference found
    storage: 'localStorage', // or 'sessionStorage' or 'cookie'
    storageKey: 'nuxt-color-mode',
  },
  runtimeConfig: {
    public: {
      // WebAuthn configuration - set via environment variables in production
      webauthnRpId: process.env.NUXT_PUBLIC_WEBAUTHN_RP_ID || 'localhost',
      webauthnOrigin: process.env.NUXT_PUBLIC_WEBAUTHN_ORIGIN || 'http://localhost:3000',
    },
  },
  pinia: {
    storesDirs: ['./stores/**'],
  },
  pwa: {
    /* PWA options */
    manifest: {
      id: '/', // Set the App ID explicitly to the root path
      name: 'CookMate',
      short_name: 'CookMate',
      description: 'CookMate is a simple app that manages your recipes and plans your meals.',
      theme_color: '#a3e635',
      background_color: '#ffffff',
      display: 'standalone',
      start_url: '/',
      scope: '/',
      orientation: 'portrait',
      icons: [
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
        {
          src: 'pwa-64x64.png',
          sizes: '64x64',
          type: 'image/png',
        },
        {
          src: 'apple-touch-icon-180x180.png',
          sizes: '180x180',
          type: 'image/png',
        },
      ],
      screenshots: [
        {
          src: '/screenshots/screenshot-desktop.png', // Make sure the path matches where your screenshot is stored
          sizes: '2472x1512', // Example resolution for desktop
          type: 'image/png',
          form_factor: 'wide', // Desktop or wide display
        },
        {
          src: '/screenshots/screenshot-mobile.png', // Path to your mobile screenshot
          sizes: '652x1398', // Example resolution for mobile
          type: 'image/png',
          form_factor: 'narrow', // Mobile display
        },
      ],
    },
    // workbox: {
    //   navigateFallback: '/', // Fallback to index.html
    //   globPatterns: [
    //     '**/*.{js,css,html,png,jpg,jpeg,svg,woff2,woff,ttf,eot,webmanifest}',
    //   ],
    // },
    client: {
      installPrompt: true,
    },
    registerWebManifestInRouteRules: true,
    devOptions: {
      enabled: true,
      navigateFallbackAllowlist: [/^\/$/],
    },
    registerType: 'autoUpdate',
  },
  devtools: { enabled: true },
})
