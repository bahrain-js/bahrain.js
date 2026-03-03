// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/content', '@nuxt/eslint', '@nuxt/fonts', '@nuxt/ui', 'v-gsap-nuxt'],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  fonts: {
    families: [
      { name: 'Inter', provider: 'google', weights: [400, 500, 600, 700, 800] }
    ]
  },

  runtimeConfig: {
    public: {
      neonAuthUrl: '',
      neonDataApiUrl: ''
    }
  },

  routeRules: {
    '/': { prerender: true },
    '/events': { ssr: false },
    '/events/**': { ssr: false },
    '/blog': { prerender: true },
    '/blog/**': { prerender: true },
    '/projects': { prerender: true },
    '/frameworks': { ssr: false },
    '/people': { ssr: false },
    '/profile': { ssr: false },
    '/admin': { ssr: false }
  },

  nitro: {
    preset: 'github-pages'
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})