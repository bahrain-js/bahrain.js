<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const communityLinks = [
  { label: 'GitHub', description: 'Explore our open-source repos', icon: 'i-simple-icons-github', to: 'https://github.com/bahrain-js', target: '_blank' },
  { label: 'npm', description: 'Packages published under @bahrainjs', icon: 'i-simple-icons-npm', to: 'https://www.npmjs.com/org/bahrain.js', target: '_blank' },
  { label: 'Reddit', description: 'Join the discussion on Reddit', icon: 'i-simple-icons-reddit', to: 'https://www.reddit.com/r/bahrainjs', target: '_blank' },
  { label: 'Discord', description: 'Chat with the community in real time', icon: 'i-simple-icons-discord', to: 'https://discord.gg/EZrDeaErBV', target: '_blank' },
  { label: 'WhatsApp', description: 'Join the WhatsApp community', icon: 'i-simple-icons-whatsapp', to: 'https://chat.whatsapp.com/CMDUyDgaBS6FYQoT4swRD0', target: '_blank' },
  { label: 'Instagram', description: 'Follow us on Instagram', icon: 'i-simple-icons-instagram', to: 'https://www.instagram.com/bahrain.js', target: '_blank' },
  { label: 'Blog', description: 'Updates, recaps, and member posts', icon: 'i-lucide-pen-line', to: '/blog' }
]

const navItems: NavigationMenuItem[] = [
  { label: 'Events', icon: 'i-lucide-calendar', to: '/events' },
  { label: 'Projects', icon: 'i-lucide-code-2', to: '/projects' },
  { label: 'Frameworks', icon: 'i-lucide-blocks', to: '/frameworks' },
  { label: 'People', icon: 'i-lucide-users', to: '/people' },
  { label: 'Opportunities', icon: 'i-lucide-briefcase', to: '/opportunities' },
  {
    label: 'Community',
    icon: 'i-lucide-heart',
    children: communityLinks
  }
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
  <UHeader
    mode="drawer"
    :toggle="{ size: 'lg' as const }"
  >
    <template #left>
      <NuxtLink
        to="/"
        class="flex items-center"
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
      <!-- Navigation links — large touch targets -->
      <nav class="flex flex-col gap-1">
        <template
          v-for="item in navItems"
          :key="item.label"
        >
          <!-- Regular nav links -->
          <NuxtLink
            v-if="!item.children"
            :to="item.to"
            class="flex items-center gap-4 px-3 py-3.5 rounded-lg text-lg font-medium text-muted hover:text-highlighted hover:bg-elevated/50 active:bg-elevated transition-colors"
            active-class="!text-primary bg-primary/10"
          >
            <UIcon
              :name="item.icon!"
              class="size-6 shrink-0"
            />
            {{ item.label }}
          </NuxtLink>

          <!-- Community section with sub-links -->
          <template v-else>
            <p class="flex items-center gap-4 px-3 pt-5 pb-2 text-xs font-semibold uppercase tracking-wider text-muted">
              <UIcon
                :name="item.icon!"
                class="size-4 shrink-0"
              />
              {{ item.label }}
            </p>
            <NuxtLink
              v-for="child in item.children"
              :key="child.label"
              :to="child.to"
              :target="(child as any).target"
              class="flex items-center gap-4 px-3 py-3 rounded-lg text-base text-muted hover:text-highlighted hover:bg-elevated/50 active:bg-elevated transition-colors ms-2"
              active-class="!text-primary bg-primary/10"
            >
              <UIcon
                :name="child.icon!"
                class="size-5 shrink-0"
              />
              {{ child.label }}
            </NuxtLink>
          </template>
        </template>
      </nav>

      <USeparator class="my-4" />

      <!-- Auth section -->
      <div class="flex flex-col gap-2">
        <template v-if="isAuthenticated && authUser">
          <div class="flex items-center gap-3 px-3 py-2">
            <UAvatar
              :src="authUser.image"
              :alt="authUser.name || 'User'"
              size="md"
            />
            <div class="min-w-0">
              <p class="text-sm font-medium text-highlighted truncate">
                {{ authUser.name }}
              </p>
              <p class="text-xs text-muted truncate">
                {{ authUser.email }}
              </p>
            </div>
          </div>

          <NuxtLink
            to="/profile"
            class="flex items-center gap-4 px-3 py-3 rounded-lg text-base text-muted hover:text-highlighted hover:bg-elevated/50 transition-colors"
          >
            <UIcon
              name="i-lucide-user"
              class="size-5 shrink-0"
            />
            My Profile
          </NuxtLink>

          <NuxtLink
            v-if="isAdmin"
            to="/admin"
            class="flex items-center gap-4 px-3 py-3 rounded-lg text-base text-muted hover:text-highlighted hover:bg-elevated/50 transition-colors"
          >
            <UIcon
              name="i-lucide-shield"
              class="size-5 shrink-0"
            />
            Admin
          </NuxtLink>

          <button
            class="flex items-center gap-4 px-3 py-3 rounded-lg text-base text-muted hover:text-highlighted hover:bg-elevated/50 transition-colors w-full text-left"
            @click="signOut"
          >
            <UIcon
              name="i-lucide-log-out"
              class="size-5 shrink-0"
            />
            Sign out
          </button>
        </template>

        <UButton
          v-else-if="!authLoading"
          icon="i-simple-icons-github"
          label="Sign in with GitHub"
          color="neutral"
          variant="outline"
          size="xl"
          block
          @click="signInWithGitHub"
        />
      </div>

      <USeparator class="my-4" />

      <div class="flex items-center justify-end px-1">
        <UColorModeButton size="lg" />
      </div>
    </template>
  </UHeader>
</template>
