<script setup lang="ts">
defineProps<{
  listings: any[]
  oppActionId: string | null
}>()

const emit = defineEmits<{
  'update-status': [opp: any, status: string]
  'delete-oss': [opp: any]
  'create': [form: { project_name: string, description: string, difficulty: string, issues_label: string, url: string, tags: string[] }]
  'edit': [id: string, form: { project_name: string, description: string, difficulty: string, issues_label: string, url: string, tags: string[] }]
}>()

const showForm = ref(false)
const form = ref({ project_name: '', description: '', difficulty: 'beginner', issues_label: '', url: '', tags: [] as string[] })

const showEditForm = ref(false)
const editingId = ref<string | null>(null)
const editForm = ref({ project_name: '', description: '', difficulty: 'beginner', issues_label: '', url: '', tags: [] as string[] })

function submit() {
  emit('create', { ...form.value })
  showForm.value = false
  form.value = { project_name: '', description: '', difficulty: 'beginner', issues_label: '', url: '', tags: [] }
}

function openEdit(opp: any) {
  editingId.value = opp.id
  editForm.value = {
    project_name: opp.project_name || '',
    description: opp.description || '',
    difficulty: opp.difficulty || 'beginner',
    issues_label: opp.issues_label || '',
    url: opp.url || '',
    tags: Array.isArray(opp.tags) ? [...opp.tags] : []
  }
  showEditForm.value = true
}

function submitEdit() {
  if (!editingId.value) return
  emit('edit', editingId.value, { ...editForm.value })
  showEditForm.value = false
  editingId.value = null
}
</script>

<template>
  <UCard>
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">
          Open Source
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
          v-for="opp in listings"
          :key="opp.id"
          class="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
        >
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <p class="font-medium truncate">
                {{ opp.project_name }}
              </p>
              <UBadge
                :color="opp.status === 'active' ? 'success' : 'neutral'"
                variant="subtle"
                size="xs"
              >
                {{ opp.status }}
              </UBadge>
              <UBadge
                :color="opp.difficulty === 'beginner' ? 'success' : opp.difficulty === 'intermediate' ? 'info' : 'warning'"
                variant="subtle"
                size="xs"
              >
                {{ opp.difficulty }}
              </UBadge>
            </div>
            <p class="text-sm text-muted truncate">
              {{ opp.description }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <USelect
              :model-value="opp.status"
              :items="[
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' }
              ]"
              size="xs"
              class="w-28"
              :loading="oppActionId === opp.id"
              @update:model-value="(val: string) => emit('update-status', opp, val)"
            />
            <UButton
              icon="i-lucide-pencil"
              color="neutral"
              variant="ghost"
              size="xs"
              @click="openEdit(opp)"
            />
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              size="xs"
              :loading="oppActionId === opp.id"
              @click="emit('delete-oss', opp)"
            />
          </div>
        </div>
      </div>

      <UEmpty
        v-if="!listings.length"
        icon="i-lucide-git-pull-request"
        title="No projects"
        description="Add an open source project."
      />
    </div>
  </UCard>

  <!-- Add OSS Modal -->
  <UModal v-model:open="showForm">
    <template #content>
      <div class="p-6 space-y-4">
        <h3 class="text-lg font-semibold">
          Add Open Source Project
        </h3>
        <UFormField label="Project Name">
          <UInput
            v-model="form.project_name"
            placeholder="e.g. @bahrain.js/toolkit"
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
          <UFormField label="Difficulty">
            <USelect
              v-model="form.difficulty"
              :items="['beginner', 'intermediate', 'advanced']"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Issues Label">
            <UInput
              v-model="form.issues_label"
              placeholder="e.g. Good first issues"
              class="w-full"
            />
          </UFormField>
        </div>
        <UFormField label="GitHub URL">
          <UInput
            v-model="form.url"
            placeholder="https://github.com/..."
            class="w-full"
          />
        </UFormField>
        <UFormField label="Tags">
          <UInputTags
            v-model="form.tags"
            placeholder="Add a tag..."
            class="w-full"
          />
        </UFormField>
        <div class="flex justify-end gap-2 pt-2">
          <UButton
            label="Cancel"
            variant="outline"
            @click="showForm = false"
          />
          <UButton
            label="Create"
            :disabled="!form.project_name"
            @click="submit"
          />
        </div>
      </div>
    </template>
  </UModal>

  <!-- Edit OSS Modal -->
  <UModal v-model:open="showEditForm">
    <template #content>
      <div class="p-6 space-y-4">
        <h3 class="text-lg font-semibold">
          Edit Project
        </h3>
        <UFormField label="Project Name">
          <UInput
            v-model="editForm.project_name"
            placeholder="e.g. @bahrain.js/toolkit"
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
          <UFormField label="Difficulty">
            <USelect
              v-model="editForm.difficulty"
              :items="['beginner', 'intermediate', 'advanced']"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Issues Label">
            <UInput
              v-model="editForm.issues_label"
              placeholder="e.g. Good first issues"
              class="w-full"
            />
          </UFormField>
        </div>
        <UFormField label="GitHub URL">
          <UInput
            v-model="editForm.url"
            placeholder="https://github.com/..."
            class="w-full"
          />
        </UFormField>
        <UFormField label="Tags">
          <UInputTags
            v-model="editForm.tags"
            placeholder="Add a tag..."
            class="w-full"
          />
        </UFormField>
        <div class="flex justify-end gap-2 pt-2">
          <UButton
            label="Cancel"
            variant="outline"
            @click="showEditForm = false"
          />
          <UButton
            label="Save"
            :disabled="!editForm.project_name"
            @click="submitEdit"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
