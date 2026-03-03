import { defineCollection, defineContentConfig, z } from '@nuxt/content'
// import { z } from 'zod'

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: 'page',
      source: 'blog/**/*.md',
      schema: z.object({
        date: z.string(),
        author: z.string(),
        author_github: z.string().optional(),
        tags: z.array(z.string()).optional(),
        cover_image: z.string().optional(),
        featured: z.boolean().default(false)
      })
    })
  }
})
