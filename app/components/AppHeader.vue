<script setup lang="ts">
const navItems = [
  { label: 'Events', icon: 'i-lucide-calendar', to: '/events' },
  { label: 'Projects', icon: 'i-lucide-code-2', to: '/projects' },
  { label: 'Frameworks', icon: 'i-lucide-blocks', to: '/frameworks' },
  { label: 'People', icon: 'i-lucide-users', to: '/people' },
  { label: 'Opportunities', icon: 'i-lucide-briefcase', to: '/opportunities' },
  { label: 'Blog', icon: 'i-lucide-pen-line', to: '/blog' }
]

const { user: authUser, isAuthenticated, loading: authLoading, signInWithGitHub, signOut } = useAuth()
const { isAdmin } = useAdmin()

const userMenuItems = computed(() => {
  const items = [
    [
      {
        label: 'My Profile',
        icon: 'i-lucide-user',
        to: '/profile'
      },
      ...(isAdmin.value
        ? [
            {
              type: 'separator'
            },
            {
              label: 'Admin',
              icon: 'i-lucide-shield',
              to: '/admin'
            },
            {
              type: 'separator'
            }
          ]
        : []),
      {
        label: 'Sign out',
        icon: 'i-lucide-log-out',
        onSelect: signOut
      }
    ]
  ]
  return items
})
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink
        to="/"
        class="flex items-center mt-10"
      >
        <AppLogo />
      </NuxtLink>
    </template>

    <template #default>
      <UNavigationMenu :items="navItems" />
    </template>

    <template #right>
      <UColorModeButton />

      <UButton
        to="https://github.com/bahrain-js"
        target="_blank"
        icon="i-simple-icons-github"
        aria-label="GitHub"
        color="neutral"
        variant="ghost"
      />

      <UButton
        to="https://discord.gg/EZrDeaErBV"
        target="_blank"
        icon="i-simple-icons-discord"
        aria-label="Discord"
        color="neutral"
        variant="ghost"
      />

      <template v-if="isAuthenticated && authUser">
        <UDropdownMenu
          :items="userMenuItems"
        >
          <UAvatar
            :src="authUser.image"
            :alt="authUser.name || 'User'"
            size="sm"
            class="cursor-pointer"
          />
        </UDropdownMenu>
      </template>
      <UButton
        v-else-if="!authLoading"
        icon="i-simple-icons-github"
        label="Sign in"
        color="neutral"
        variant="outline"
        size="sm"
        @click="signInWithGitHub"
      />
    </template>

    <template #body>
      <UNavigationMenu
        :items="navItems"
        orientation="vertical"
        class="-mx-2.5 w-full"
      />
    </template>
  </UHeader>
</template>
