<script setup lang="ts">
defineProps<{
  jobs: any[]
  statusBadgeColor: Record<string, 'warning' | 'success' | 'error' | 'neutral'>
  oppActionId: string | null
}>()

const emit = defineEmits<{
  'update-status': [job: any, status: string]
  'delete-job': [job: any]
  'create': [form: { title: string, company: string, description: string, location: string, url: string, salary_range: string, is_remote: boolean, tags: string }]
}>()

const showForm = ref(false)
const form = ref({ title: '', company: '', description: '', location: '', url: '', salary_range: '', is_remote: false, tags: '' })

function submit() {
  emit('create', { ...form.value })
  showForm.value = false
  form.value = { title: '', company: '', description: '', location: '', url: '', salary_range: '', is_remote: false, tags: '' }
}
</script>

<template>
  <UCard>
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">
          Job Listings
        </h2>
        <UButton
          label="Add Job"
          icon="i-lucide-plus"
          size="xs"
          @click="showForm = true"
        />
      </div>

      <div class="divide-y divide-zinc-200 dark:divide-zinc-800">
        <div
          v-for="job in jobs"
          :key="job.id"
          class="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
        >
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <p class="font-medium truncate">
                {{ job.title }}
              </p>
              <UBadge
                :color="statusBadgeColor[job.status] || 'neutral'"
                variant="subtle"
                size="xs"
              >
                {{ job.status }}
              </UBadge>
              <UBadge
                v-if="job.is_remote"
                color="info"
                variant="subtle"
                size="xs"
              >
                Remote
              </UBadge>
            </div>
            <p
              v-if="job.company"
              class="text-sm text-muted"
            >
              {{ job.company }} <span v-if="job.location">· {{ job.location }}</span>
            </p>
          </div>
          <div class="flex items-center gap-2">
            <USelect
              :model-value="job.status"
              :items="[
                { label: 'Pending', value: 'pending' },
                { label: 'Approved', value: 'approved' },
                { label: 'Rejected', value: 'rejected' }
              ]"
              size="xs"
              class="w-28"
              :loading="oppActionId === job.id"
              @update:model-value="(val: string) => emit('update-status', job, val)"
            />
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              size="xs"
              :loading="oppActionId === job.id"
              @click="emit('delete-job', job)"
            />
          </div>
        </div>
      </div>

      <UEmpty
        v-if="!jobs.length"
        icon="i-lucide-briefcase"
        title="No jobs"
        description="Add a job listing."
      />
    </div>
  </UCard>

  <!-- Add Job Modal -->
  <UModal v-model:open="showForm">
    <template #content>
      <div class="p-6 space-y-4">
        <h3 class="text-lg font-semibold">
          Add Job Listing
        </h3>
        <UFormField label="Job Title">
          <UInput
            v-model="form.title"
            placeholder="e.g. Senior Frontend Developer"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Company">
          <UInput
            v-model="form.company"
            placeholder="e.g. Acme Corp"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Description">
          <UTextarea
            v-model="form.description"
            placeholder="Job description..."
            class="w-full"
          />
        </UFormField>
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Location">
            <UInput
              v-model="form.location"
              placeholder="e.g. Manama, Bahrain"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Salary Range">
            <UInput
              v-model="form.salary_range"
              placeholder="e.g. $60k-$80k"
              class="w-full"
            />
          </UFormField>
        </div>
        <UFormField label="Apply URL">
          <UInput
            v-model="form.url"
            placeholder="https://..."
            class="w-full"
          />
        </UFormField>
        <UFormField label="Tags (comma separated)">
          <UInput
            v-model="form.tags"
            placeholder="Vue, TypeScript, Node.js"
            class="w-full"
          />
        </UFormField>
        <UCheckbox
          v-model="form.is_remote"
          label="Remote position"
        />
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
</template>
