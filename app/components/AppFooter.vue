<template>
  <UFooter>
    <template #left>
      <div class="flex items-center gap-3">
        <AppLogo />
        <p class="text-sm text-muted">
          The JavaScript community in Bahrain
        </p>
      </div>
    </template>

    <template #center>
      <div class="flex items-center gap-4 text-sm text-muted">
        <NuxtLink
          to="/events"
          class="hover:text-default transition-colors"
        >
          Events
        </NuxtLink>
        <NuxtLink
          to="/projects"
          class="hover:text-default transition-colors"
        >
          Projects
        </NuxtLink>
        <NuxtLink
          to="/people"
          class="hover:text-default transition-colors"
        >
          People
        </NuxtLink>
        <NuxtLink
          to="/blog"
          class="hover:text-default transition-colors"
        >
          Blog
        </NuxtLink>
      </div>
    </template>

    <template #right>
      <div class="flex items-center gap-1">
        <UButton
          to="https://github.com/bahrain-js"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          color="neutral"
          variant="ghost"
          size="sm"
        />
        <UButton
          to="https://www.npmjs.com/org/bahrainjs"
          target="_blank"
          icon="i-simple-icons-npm"
          aria-label="npm"
          color="neutral"
          variant="ghost"
          size="sm"
        />
      </div>
    </template>
  </UFooter>
</template>
