export default defineNuxtConfig({
  ssr: false,

  extends: [
    './layers/tairo-layout-collapse',
    './layers/tairo',
  ],
  build:{
    transpile:['@vuepic/vue-datepicker']
  },

  devtools: { enabled: false },
  pages: true,

  modules: [
    '@pinia/nuxt',
  ],

  pinia: {
    storesDirs: ['./stores/**', './components/**/stores', './views/**/stores'],

  },

  css: [
    '~/assets/css/style.css',
  ],

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      viewport: 'width=device-width,initial-scale=1',
      link: [
        { rel: 'icon', href: '/logo.svg', sizes: 'any' },
        { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true },
        { href: 'https://fonts.googleapis.com/css2?family=Tajawal:wght@200;300;400;500;700;800;900&display=swap', rel: 'stylesheet' },
      ],
    }
  },

  compatibilityDate: '2024-08-06',
})
