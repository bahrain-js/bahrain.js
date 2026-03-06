<script setup lang="ts">
const route = useRoute()
const contentPath = `/blog/${route.params.slug}`

const { data: post } = await useAsyncData(`blog-${contentPath}`, () =>
  queryCollection('blog')
    .path(contentPath)
    .first()
)

if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found' })
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function estimateReadingTime(description: string) {
  // Rough estimate based on description length + typical post
  // A real implementation would count body words
  const words = description.split(/\s+/).length
  const minutes = Math.max(2, Math.ceil(words / 40))
  return `${minutes} min read`
}

useSeoMeta({
  title: `${post.value.title} — Bahrain.js Blog`,
  description: post.value.description
})
</script>

<template>
  <UContainer
    v-if="post"
    class="py-16 max-w-3xl"
  >
    <!-- Back link -->
    <NuxtLink
      to="/blog"
      class="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-yellow-500 transition-colors mb-8"
    >
      <UIcon
        name="i-lucide-arrow-left"
        class="size-4"
      />
      All posts
    </NuxtLink>

    <!-- Header -->
    <header class="mb-10">
      <!-- Tags -->
      <div
        v-if="post.tags?.length"
        class="flex flex-wrap gap-1.5 mb-4"
      >
        <NuxtLink
          v-for="tag in post.tags"
          :key="tag"
          :to="`/blog?tag=${tag}`"
          class="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-yellow-100 hover:text-yellow-700 dark:hover:bg-yellow-900/30 dark:hover:text-yellow-400 transition-colors"
        >
          {{ tag }}
        </NuxtLink>
      </div>

      <h1 class="text-3xl font-extrabold tracking-tight sm:text-4xl">
        {{ post.title }}
      </h1>

      <p class="mt-4 text-lg text-zinc-500 dark:text-zinc-400">
        {{ post.description }}
      </p>

      <!-- Author & meta -->
      <div class="flex items-center gap-4 mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <div class="flex items-center gap-3">
          <!-- Author avatar from GitHub -->
          <img
            v-if="post.author_github"
            :src="`https://github.com/${post.author_github}.png?size=80`"
            :alt="post.author"
            class="size-10 rounded-full"
          >
          <div
            v-else
            class="size-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center"
          >
            <UIcon
              name="i-lucide-user"
              class="size-5 text-zinc-400"
            />
          </div>
          <div>
            <div class="text-sm font-medium">
              <a
                v-if="post.author_github"
                :href="`https://github.com/${post.author_github}`"
                target="_blank"
                class="hover:text-yellow-500 transition-colors"
              >
                {{ post.author }}
              </a>
              <span v-else>{{ post.author }}</span>
            </div>
            <div class="text-xs text-zinc-400 dark:text-zinc-500 flex items-center gap-2">
              <span>{{ formatDate(post.date) }}</span>
              <span>·</span>
              <span>{{ estimateReadingTime(post.description) }}</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Body content -->
    <div class="prose dark:prose-invert max-w-none">
      <ContentRenderer :value="post" />
    </div>
  </UContainer>
</template>
