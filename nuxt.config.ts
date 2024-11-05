// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  // https://nuxt.com/docs/getting-started/upgrade#testing-nuxt-4
  future: { compatibilityVersion: 4 },

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
  colorMode: {
    preference: 'system', // default value of $colorMode.preference
    fallback: 'light', // fallback value if not system preference found
    storage: 'localStorage', // or 'sessionStorage' or 'cookie'
    storageKey: 'nuxt-color-mode',
  },
  pinia: {
    storesDirs: ['./stores/**'],
  },
  devtools: { enabled: true },
})
