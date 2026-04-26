// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  modules: ['@nuxt/content', '@nuxt/eslint', '@nuxt/fonts', '@nuxt/ui', 'v-gsap-nuxt'],
  devtools: {
    enabled: true
  },

  // GitHub Pages returns 301 redirects with http:// (not https://) when adding
  // a trailing slash. Since Cloudflare proxies over HTTPS, this causes
  // cross-protocol errors. Force trailing slashes so the redirect never fires.
  experimental: {
    defaults: {
      nuxtLink: {
        trailingSlash: 'append'
      }
    }
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      neonAuthUrl: '',
      neonDataApiUrl: '',
      siteUrl: 'https://bahrain.js.org'
    }
  },

  routeRules: {
    '/': { prerender: true },
    '/events': { ssr: false },
    '/events/**': { ssr: false },
    '/blog': { prerender: true },
    '/blog/**': { prerender: true },
    '/projects': { ssr: false },
    '/frameworks': { ssr: false },
    '/people': { ssr: false },
    '/profile': { ssr: false },
    '/admin': { ssr: false }
  },

  compatibilityDate: '2026-03-05',

  nitro: {
    preset: 'github-pages',
    prerender: {
      failOnError: false
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  fonts: {
    families: [
      { name: 'Inter', provider: 'google', weights: [400, 500, 600, 700, 800] }
    ]
  }
})
