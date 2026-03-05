<script setup lang="ts">
defineProps<{
  projects: any[]
  oppActionId: string | null
}>()

const emit = defineEmits<{
  'update-status': [project: any, status: string]
  'delete-project': [project: any]
  'create': [form: { name: string, slug: string, description: string, stack: string[], stage: string, featured: boolean, start_here: boolean, npm_package: string, url: string }]
  'edit': [id: string, form: { name: string, slug: string, description: string, stack: string[], stage: string, featured: boolean, start_here: boolean, npm_package: string, url: string }]
}>()

const stageOptions = ['idea', 'prototype', 'repo', 'package']

const showForm = ref(false)
const form = ref({
  name: '', slug: '', description: '', stack: [] as string[],
  stage: 'idea', featured: false, start_here: false, npm_package: '', url: ''
})

const showEditForm = ref(false)
const editingId = ref<string | null>(null)
const editForm = ref({
  name: '', slug: '', description: '', stack: [] as string[],
  stage: 'idea', featured: false, start_here: false, npm_package: '', url: ''
})

function autoSlug(name: string): string {
  return name.toLowerCase().replace(/[@./]/g, '').replace(/\s+/g, '-').replace(/--+/g, '-')
}

watch(() => form.value.name, (val) => {
  if (showForm.value && !editingId.value) {
    form.value.slug = autoSlug(val)
  }
})

function submit() {
  emit('create', { ...form.value })
  showForm.value = false
  form.value = { name: '', slug: '', description: '', stack: [], stage: 'idea', featured: false, start_here: false, npm_package: '', url: '' }
}

function openEdit(project: any) {
  editingId.value = project.id
  editForm.value = {
    name: project.name || '',
    slug: project.slug || '',
    description: project.description || '',
    stack: Array.isArray(project.stack) ? [...project.stack] : [],
    stage: project.stage || 'idea',
    featured: !!project.featured,
    start_here: !!project.start_here,
    npm_package: project.npm_package || '',
    url: project.url || ''
  }
  showEditForm.value = true
}

function submitEdit() {
  if (!editingId.value) return
  emit('edit', editingId.value, { ...editForm.value })
  showEditForm.value = false
  editingId.value = null
}

const stageColor: Record<string, string> = {
  idea: 'neutral',
  prototype: 'info',
  repo: 'success',
  package: 'warning'
}
</script>

<template>
  <UCard>
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">
          Projects
        </h2>
        <UButton
          label="Add Project"
          icon="i-lucide-plus"
          size="xs"
          @click="showForm = true"
        />
      </div>

      <div class="divide-y divide-zinc-200 dark:divide-zinc-800">
        <div
          v-for="project in projects"
          :key="project.id"
          class="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
        >
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <p class="font-medium truncate">
                {{ project.name }}
              </p>
              <UBadge
                :color="project.status === 'active' ? 'success' : 'neutral'"
                variant="subtle"
                size="xs"
              >
                {{ project.status }}
              </UBadge>
              <UBadge
                :color="(stageColor[project.stage] as any) || 'neutral'"
                variant="subtle"
                size="xs"
              >
                {{ project.stage }}
              </UBadge>
              <UBadge
                v-if="project.featured"
                color="warning"
                variant="subtle"
                size="xs"
              >
                featured
              </UBadge>
              <UBadge
                v-if="project.start_here"
                color="success"
                variant="subtle"
                size="xs"
              >
                start here
              </UBadge>
            </div>
            <p class="text-sm text-muted truncate">
              {{ project.description }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <USelect
              :model-value="project.status"
              :items="[
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' }
              ]"
              size="xs"
              class="w-28"
              :loading="oppActionId === project.id"
              @update:model-value="(val: string) => emit('update-status', project, val)"
            />
            <UButton
              icon="i-lucide-pencil"
              color="neutral"
              variant="ghost"
              size="xs"
              @click="openEdit(project)"
            />
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              size="xs"
              :loading="oppActionId === project.id"
              @click="emit('delete-project', project)"
            />
          </div>
        </div>
      </div>

      <UEmpty
        v-if="!projects.length"
        icon="i-lucide-folder-git-2"
        title="No projects"
        description="Add a community project."
      />
    </div>
  </UCard>

  <!-- Add Project Modal -->
  <UModal v-model:open="showForm">
    <template #content>
      <div class="p-6 space-y-4">
        <h3 class="text-lg font-semibold">
          Add Project
        </h3>
        <UFormField label="Name">
          <UInput
            v-model="form.name"
            placeholder="e.g. @bahrain.js/toolkit"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Slug">
          <UInput
            v-model="form.slug"
            placeholder="e.g. toolkit"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Description">
          <UTextarea
            v-model="form.description"
            placeholder="What the project does..."
            class="w-full"
          />
        </UFormField>
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Stage">
            <USelect
              v-model="form.stage"
              :items="stageOptions"
              class="w-full"
            />
          </UFormField>
          <UFormField label="npm Package">
            <UInput
              v-model="form.npm_package"
              placeholder="e.g. @bahrain.js/toolkit"
              class="w-full"
            />
          </UFormField>
        </div>
        <UFormField label="GitHub URL">
          <UInput
            v-model="form.url"
            placeholder="https://github.com/bahrain-js/..."
            class="w-full"
          />
        </UFormField>
        <UFormField label="Tech Stack">
          <UInputTags
            v-model="form.stack"
            placeholder="Add a tech..."
            class="w-full"
          />
        </UFormField>
        <div class="flex items-center gap-6">
          <label class="flex items-center gap-2 text-sm">
            <USwitch v-model="form.featured" />
            Featured
          </label>
          <label class="flex items-center gap-2 text-sm">
            <USwitch v-model="form.start_here" />
            Start Here
          </label>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <UButton
            label="Cancel"
            variant="outline"
            @click="showForm = false"
          />
          <UButton
            label="Create"
            :disabled="!form.name || !form.slug"
            @click="submit"
          />
        </div>
      </div>
    </template>
  </UModal>

  <!-- Edit Project Modal -->
  <UModal v-model:open="showEditForm">
    <template #content>
      <div class="p-6 space-y-4">
        <h3 class="text-lg font-semibold">
          Edit Project
        </h3>
        <UFormField label="Name">
          <UInput
            v-model="editForm.name"
            placeholder="e.g. @bahrain.js/toolkit"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Slug">
          <UInput
            v-model="editForm.slug"
            placeholder="e.g. toolkit"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Description">
          <UTextarea
            v-model="editForm.description"
            placeholder="What the project does..."
            class="w-full"
          />
        </UFormField>
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Stage">
            <USelect
              v-model="editForm.stage"
              :items="stageOptions"
              class="w-full"
            />
          </UFormField>
          <UFormField label="npm Package">
            <UInput
              v-model="editForm.npm_package"
              placeholder="e.g. @bahrain.js/toolkit"
              class="w-full"
            />
          </UFormField>
        </div>
        <UFormField label="GitHub URL">
          <UInput
            v-model="editForm.url"
            placeholder="https://github.com/bahrain-js/..."
            class="w-full"
          />
        </UFormField>
        <UFormField label="Tech Stack">
          <UInputTags
            v-model="editForm.stack"
            placeholder="Add a tech..."
            class="w-full"
          />
        </UFormField>
        <div class="flex items-center gap-6">
          <label class="flex items-center gap-2 text-sm">
            <USwitch v-model="editForm.featured" />
            Featured
          </label>
          <label class="flex items-center gap-2 text-sm">
            <USwitch v-model="editForm.start_here" />
            Start Here
          </label>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <UButton
            label="Cancel"
            variant="outline"
            @click="showEditForm = false"
          />
          <UButton
            label="Save"
            :disabled="!editForm.name || !editForm.slug"
            @click="submitEdit"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
