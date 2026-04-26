<script setup lang="ts">
import type { StartupIdea } from '~/types'

defineProps<{
  ideas: StartupIdea[]
  statusBadgeColor: Record<string, 'warning' | 'success' | 'error' | 'neutral'>
  oppActionId: string | null
}>()

const emit = defineEmits<{
  'update-status': [idea: StartupIdea, status: string]
  'delete-idea': [idea: StartupIdea]
  'create': [form: { title: string, problem: string, description: string, looking_for: string, sector: string, contact_url: string, tags: string[] }]
  'edit': [id: string, form: { title: string, problem: string, description: string, looking_for: string, sector: string, contact_url: string, tags: string[] }]
}>()

const showForm = ref(false)
const form = ref({ title: '', problem: '', description: '', looking_for: 'Technical Co-founder', sector: '', contact_url: '', tags: [] as string[] })

const lookingForOptions = ref([
  'Technical Co-founder',
  'Full-stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Mobile Developer',
  'Designer',
  'Any Builder'
])

function onCreateLookingFor(item: string, target: 'create' | 'edit') {
  lookingForOptions.value.push(item)
  if (target === 'create') form.value.looking_for = item
  else editForm.value.looking_for = item
}

const showEditForm = ref(false)
const editingId = ref<string | null>(null)
const editForm = ref({ title: '', problem: '', description: '', looking_for: 'Technical Co-founder', sector: '', contact_url: '', tags: [] as string[] })

function submit() {
  emit('create', { ...form.value })
  showForm.value = false
  form.value = { title: '', problem: '', description: '', looking_for: 'Technical Co-founder', sector: '', contact_url: '', tags: [] }
}

function openEdit(idea: StartupIdea) {
  editingId.value = idea.id
  editForm.value = {
    title: idea.title || '',
    problem: idea.problem || '',
    description: idea.description || '',
    looking_for: idea.looking_for || 'Technical Co-founder',
    sector: idea.sector || '',
    contact_url: idea.contact_url || '',
    tags: Array.isArray(idea.tags) ? [...idea.tags] : []
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
          Startup Ideas
        </h2>
        <UButton
          label="Add Idea"
          icon="i-lucide-plus"
          size="xs"
          @click="showForm = true"
        />
      </div>

      <div class="divide-y divide-zinc-200 dark:divide-zinc-800">
        <div
          v-for="idea in ideas"
          :key="idea.id"
          class="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
        >
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <p class="font-medium truncate">
                {{ idea.title }}
              </p>
              <UBadge
                :color="statusBadgeColor[idea.status] || 'neutral'"
                variant="subtle"
                size="xs"
              >
                {{ idea.status }}
              </UBadge>
              <UBadge
                color="warning"
                variant="subtle"
                size="xs"
              >
                {{ idea.looking_for }}
              </UBadge>
            </div>
            <p class="text-sm text-muted truncate">
              {{ idea.sector ? `${idea.sector} · ` : '' }}{{ idea.problem || idea.description }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <USelect
              :model-value="idea.status"
              :items="[
                { label: 'Pending', value: 'pending' },
                { label: 'Approved', value: 'approved' },
                { label: 'Rejected', value: 'rejected' }
              ]"
              size="xs"
              class="w-28"
              :loading="oppActionId === idea.id"
              @update:model-value="(val: string) => emit('update-status', idea, val)"
            />
            <UButton
              icon="i-lucide-pencil"
              color="neutral"
              variant="ghost"
              size="xs"
              @click="openEdit(idea)"
            />
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              size="xs"
              :loading="oppActionId === idea.id"
              @click="emit('delete-idea', idea)"
            />
          </div>
        </div>
      </div>

      <UEmpty
        v-if="!ideas.length"
        icon="i-lucide-lightbulb"
        title="No startup ideas"
        description="Add a startup idea."
      />
    </div>
  </UCard>

  <!-- Add Idea Modal -->
  <UModal v-model:open="showForm">
    <template #content>
      <div class="p-6 space-y-4">
        <h3 class="text-lg font-semibold">
          Add Startup Idea
        </h3>
        <UFormField label="Title">
          <UInput
            v-model="form.title"
            placeholder="e.g. Local Delivery Platform"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Problem Statement">
          <UTextarea
            v-model="form.problem"
            placeholder="What problem does this solve in Bahrain?"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Description">
          <UTextarea
            v-model="form.description"
            placeholder="Describe the idea..."
            class="w-full"
          />
        </UFormField>
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Looking For">
            <USelectMenu
              v-model="form.looking_for"
              :items="lookingForOptions"
              create-item
              placeholder="Select or type a new role"
              class="w-full"
              @create="(item: string) => onCreateLookingFor(item, 'create')"
            />
          </UFormField>
          <UFormField label="Sector">
            <UInput
              v-model="form.sector"
              placeholder="e.g. Fintech, EdTech"
              class="w-full"
            />
          </UFormField>
        </div>
        <UFormField label="Contact URL">
          <UInput
            v-model="form.contact_url"
            placeholder="https://..."
            class="w-full"
          />
        </UFormField>
        <UFormField label="Tags (comma separated)">
          <UInputTags
            v-model="form.tags"
            placeholder="Enter tags"
            :add-on-tab="true"
            :add-on-blur="true"
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
            :disabled="!form.title"
            @click="submit"
          />
        </div>
      </div>
    </template>
  </UModal>

  <!-- Edit Idea Modal -->
  <UModal v-model:open="showEditForm">
    <template #content>
      <div class="p-6 space-y-4">
        <h3 class="text-lg font-semibold">
          Edit Startup Idea
        </h3>
        <UFormField label="Title">
          <UInput
            v-model="editForm.title"
            placeholder="e.g. Local Delivery Platform"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Problem Statement">
          <UTextarea
            v-model="editForm.problem"
            placeholder="What problem does this solve in Bahrain?"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Description">
          <UTextarea
            v-model="editForm.description"
            placeholder="Describe the idea..."
            class="w-full"
          />
        </UFormField>
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Looking For">
            <USelectMenu
              v-model="editForm.looking_for"
              :items="lookingForOptions"
              create-item
              placeholder="Select or type a new role"
              class="w-full"
              @create="(item: string) => onCreateLookingFor(item, 'edit')"
            />
          </UFormField>
          <UFormField label="Sector">
            <UInput
              v-model="editForm.sector"
              placeholder="e.g. Fintech, EdTech"
              class="w-full"
            />
          </UFormField>
        </div>
        <UFormField label="Contact URL">
          <UInput
            v-model="editForm.contact_url"
            placeholder="https://..."
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
            :disabled="!editForm.title"
            @click="submitEdit"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
