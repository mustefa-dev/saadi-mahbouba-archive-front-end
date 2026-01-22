<script setup lang="ts">
import type { ArchiveFile } from '~/types/archive'

const props = defineProps<{
  open: boolean
  file: ArchiveFile | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

const apiPaths = useApiPaths()
const isLoading = ref(false)

const form = ref({
  fileYear: new Date().getFullYear(),
  archiveFileName: '',
  categoryId: '',
  archiveNotes: ''
})

// Watch for file changes to populate form
watch(() => props.file, (newFile) => {
  if (newFile) {
    form.value = {
      fileYear: newFile.archivedAt ? new Date(newFile.archivedAt).getFullYear() : new Date().getFullYear(),
      archiveFileName: newFile.fileName || '',
      categoryId: '',
      archiveNotes: ''
    }
  }
}, { immediate: true })

const closeModal = () => {
  emit('close')
}

const handleSave = async () => {
  if (!form.value.archiveFileName || !form.value.categoryId || !props.file) {
    return
  }

  isLoading.value = true
  try {
    await $fetch(apiPaths.archiveFileById(props.file.id), {
      method: 'PUT',
      body: form.value
    })

    emit('saved')
    closeModal()
  } catch (error: any) {
    console.error('Error updating archive file:', error)
  } finally {
    isLoading.value = false
  }
}

// Generate year options (last 50 years)
const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = currentYear; i >= currentYear - 50; i--) {
    years.push(i)
  }
  return years
})
</script>

<template>
  <TairoModal :open="open" size="lg" @close="closeModal">
    <template #header>
      <div class="flex items-center gap-3 p-4" dir="rtl">
        <div class="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-500/20">
          <Icon name="ph:pencil-simple-duotone" class="h-5 w-5 text-primary-500" />
        </div>
        <div>
          <BaseHeading size="lg" weight="medium">تعديل الملف</BaseHeading>
          <BaseParagraph size="xs" class="text-muted-400">{{ file?.fileName }}</BaseParagraph>
        </div>
      </div>
    </template>

    <div class="space-y-4 p-6" dir="rtl">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BaseSelect
          v-model="form.fileYear"
          label="سنة الملف"
          :classes="{ wrapper: 'w-full' }"
        >
          <option v-for="year in yearOptions" :key="year" :value="year">
            {{ year }}
          </option>
        </BaseSelect>

        <BaseInput
          v-model="form.archiveFileName"
          label="اسم الملف"
          placeholder="أدخل اسم الملف"
          :classes="{ wrapper: 'w-full' }"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-muted-700 dark:text-muted-300 mb-2">
          التصنيف <span class="text-danger-500">*</span>
        </label>
        <CategorySelector
          v-model="form.categoryId"
          placeholder="اختر التصنيف..."
        />
      </div>

      <BaseTextarea
        v-model="form.archiveNotes"
        label="الملاحظات"
        placeholder="أدخل ملاحظات الأرشفة (اختياري)"
        rows="3"
        :classes="{ wrapper: 'w-full' }"
      />
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-2 p-4" dir="rtl">
        <BaseButton color="muted" @click="closeModal">
          إلغاء
        </BaseButton>
        <BaseButton
          color="primary"
          :loading="isLoading"
          :disabled="!form.archiveFileName || !form.categoryId"
          @click="handleSave"
        >
          <Icon name="ph:check" class="h-4 w-4" />
          <span>حفظ التغييرات</span>
        </BaseButton>
      </div>
    </template>
  </TairoModal>
</template>
