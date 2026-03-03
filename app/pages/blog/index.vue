<script setup lang="ts">
const selectedTag = ref<string | null>(null)

const { data: posts } = await useAsyncData('blog-posts', () =>
  queryCollection('blog')
    .order('date', 'DESC')
    .all()
)

const allTags = computed(() => {
  if (!posts.value) return []
  const tags = new Set<string>()
  for (const post of posts.value) {
    if (post.tags) {
      for (const tag of post.tags) {
        tags.add(tag)
      }
    }
  }
  return Array.from(tags).sort()
})

const filteredPosts = computed(() => {
  if (!posts.value) return []
  if (!selectedTag.value) return posts.value
  return posts.value.filter(p => p.tags?.includes(selectedTag.value!))
})

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function toggleTag(tag: string) {
  selectedTag.value = selectedTag.value === tag ? null : tag
}

useSeoMeta({
  title: 'Blog — Bahrain.js',
  description: 'Updates, guides, recaps, and stories from the Bahrain.js community.'
})
</script>

<template>
  <UContainer class="py-16">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl">
        Blog
      </h1>
      <p class="mt-4 text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
        Updates, guides, recaps, and stories from the community.
      </p>
    </div>

    <!-- Tag filter -->
    <div
      v-if="allTags.length"
      class="flex flex-wrap gap-2 justify-center mb-10"
    >
      <UButton
        v-for="tag in allTags"
        :key="tag"
        :label="tag"
        :variant="selectedTag === tag ? 'solid' : 'outline'"
        size="xs"
        @click="toggleTag(tag)"
      />
      <UButton
        v-if="selectedTag"
        label="Clear"
        icon="i-lucide-x"
        variant="ghost"
        size="xs"
        @click="selectedTag = null"
      />
    </div>

    <!-- Posts grid -->
    <div
      v-if="filteredPosts.length"
      class="grid gap-8 max-w-3xl mx-auto"
    >
      <article
        v-for="post in filteredPosts"
        :key="post.path"
      >
        <NuxtLink
          :to="post.path"
          class="group block"
        >
          <UCard class="hover:ring-2 hover:ring-yellow-400/50 transition-all">
            <div class="flex flex-col gap-3">
              <!-- Featured badge -->
              <div
                v-if="post.featured"
                class="flex items-center gap-1 text-xs font-medium text-yellow-600 dark:text-yellow-400"
              >
                <UIcon
                  name="i-lucide-star"
                  class="size-3.5"
                />
                Featured
              </div>

              <!-- Title -->
              <h2 class="text-xl font-bold group-hover:text-yellow-500 transition-colors">
                {{ post.title }}
              </h2>

              <!-- Description -->
              <p class="text-zinc-500 dark:text-zinc-400">
                {{ post.description }}
              </p>

              <!-- Meta -->
              <div class="flex items-center gap-4 text-sm text-zinc-400 dark:text-zinc-500">
                <span class="flex items-center gap-1">
                  <UIcon
                    name="i-lucide-user"
                    class="size-3.5"
                  />
                  {{ post.author }}
                </span>
                <span class="flex items-center gap-1">
                  <UIcon
                    name="i-lucide-calendar"
                    class="size-3.5"
                  />
                  {{ formatDate(post.date) }}
                </span>
              </div>

              <!-- Tags -->
              <div
                v-if="post.tags?.length"
                class="flex flex-wrap gap-1.5"
              >
                <span
                  v-for="tag in post.tags"
                  :key="tag"
                  class="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </UCard>
        </NuxtLink>
      </article>
    </div>

    <!-- Empty state -->
    <div
      v-else
      class="text-center py-12"
    >
      <UIcon
        name="i-lucide-file-text"
        class="size-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4"
      />
      <p class="text-zinc-500 dark:text-zinc-400">
        No posts found{{ selectedTag ? ` for tag "${selectedTag}"` : '' }}.
      </p>
    </div>
  </UContainer>
</template>
