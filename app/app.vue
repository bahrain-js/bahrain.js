<script setup>
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    // <!-- For IE10 Metro -->
    { name: 'msapplication-TileColor', content: '#FFFFFF' },
    { name: 'msapplication-TileImage', content: 'favicon-144.png' },
    { name: 'theme-color', content: '#ffffff' },
  ],
  link: [
    //  <!-- For old IEs -->
    { rel: 'shortcut icon', href: 'favicon.ico' },
                
    // <!-- For new browsers - multisize ico -->
    { rel: 'icon', type: 'image/x-icon', sizes: '16x16 32x32', href: 'favicon.ico' },
                
    // <!-- For iPad with high - resolution Retina display running iOS ≥ 7: -->
    { rel: 'apple-touch-icon', sizes: '152x152', href: 'favicon-152-precomposed.png' },
                
    // <!-- For iPad with high - resolution Retina display running iOS ≤ 6: -->
    { rel: 'apple-touch-icon', sizes: '144x144', href: 'favicon-144-precomposed.png' },
                
    // <!-- For iPhone with high - resolution Retina display running iOS ≥ 7: -->
    { rel: 'apple-touch-icon', sizes: '120x120', href: 'favicon-120-precomposed.png' },
                
    // <!-- For iPhone with high - resolution Retina display running iOS ≤ 6: -->
    { rel: 'apple-touch-icon', sizes: '114x114', href: 'favicon-114-precomposed.png' },
                
    // <!-- For iPhone 6 + -->
    { rel: 'apple-touch-icon', sizes: '180x180', href: 'favicon-180-precomposed.png' },
                
    // <!-- For first - and second - generation iPad: -->
    { rel: 'apple-touch-icon', sizes: '72x72', href: 'favicon-72-precomposed.png' },
                
    // <!-- For non - Retina iPhone, iPod Touch, and Android 2.1 + devices: -->
    { rel: 'apple-touch-icon', sizes: '57x57', href: 'favicon-57.png' },
                
    // <!-- For Old Chrome -->
    { rel: 'icon', sizes: '32x32', href: 'favicon-32.png' },
                
    // <!-- Chrome for Android -->
    { rel: 'manifest', href: 'manifest.json' },
    { rel: 'icon', sizes: '192x192', href: 'favicon-192.png' },
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'Bahrain.js — JavaScript Community'
const description = 'The home of JavaScript in Bahrain. Build, ship, learn, and connect with the local JS community.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <AppHeader />

    <UMain>
      <NuxtPage />
    </UMain>

    <AppFooter />
  </UApp>
</template>
