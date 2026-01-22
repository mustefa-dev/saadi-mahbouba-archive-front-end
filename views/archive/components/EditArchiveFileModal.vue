<script setup lang="ts">
import type { ArchiveFile, Category } from '~/types/archive'

const props = defineProps<{
  open: boolean
  file: ArchiveFile | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

const apiPaths = useApiPaths()

// Form state
const form = ref({
  title: '',
  description: '',
  categoryId: undefined as string | undefined,
  fileYear: undefined as number | undefined,
  archiveFileName: ''
})

const saving = ref(false)
const error = ref('')

// Categories for selection
const categories = ref<Category[]>([])
const loadingCategories = ref(false)
const showCategoryBrowser = ref(false)
const selectedCategoryName = ref('')

// Year options (from 2099 down to 1950)
const yearOptions = Array.from({ length: 150 }, (_, i) => 2099 - i)

// Fetch categories
const fetchCategories = async () => {
  loadingCategories.value = true
  try {
    const response = await $fetch<any>(apiPaths.categoryFlat)
    categories.value = response || []
  } catch (err) {
    console.error('Error fetching categories:', err)
  } finally {
    loadingCategories.value = false
  }
}

// Initialize form when file changes
watch(() => props.file, (file) => {
  if (file) {
    form.value = {
      title: file.fileName || '',
      description: '',
      categoryId: undefined, // We don't have categoryId in ArchiveFile, need to fetch
      fileYear: undefined,
      archiveFileName: file.fileName || ''
    }
    selectedCategoryName.value = file.categoryName || ''
  }
}, { immediate: true })

// Fetch categories when modal opens
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    fetchCategories()
  }
})

// Handle category selection from browser
const handleCategorySelect = (categoryId: string | undefined) => {
  form.value.categoryId = categoryId
  if (categoryId) {
    const category = categories.value.find(c => c.id === categoryId)
    selectedCategoryName.value = category?.name || ''
  } else {
    selectedCategoryName.value = ''
  }
}

// Format category option with indentation
const formatCategoryOption = (category: any) => {
  const indent = '—'.repeat(category.level || 0)
  return indent ? `${indent} ${category.name}` : category.name
}

// Save changes
const handleSave = async () => {
  if (!props.file) return

  saving.value = true
  error.value = ''

  try {
    const updateData: any = {}

    if (form.value.archiveFileName) {
      updateData.archiveFileName = form.value.archiveFileName
      updateData.title = form.value.archiveFileName
    }
    if (form.value.description) {
      updateData.description = form.value.description
    }
    if (form.value.categoryId) {
      updateData.categoryId = form.value.categoryId
    }
    if (form.value.fileYear) {
      updateData.fileYear = form.value.fileYear
    }

    await $fetch(apiPaths.reportById(props.file.id), {
      method: 'PUT',
      body: updateData
    })

    emit('saved')
    emit('close')
  } catch (err: any) {
    console.error('Error updating file:', err)
    error.value = err?.data?.message || 'حدث خطأ أثناء حفظ التغييرات'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <TairoModal :open="open" size="md" @close="emit('close')">
    <template #header>
      <div class="flex items-center gap-2">
        <Icon name="ph:pencil-simple-duotone" class="w-5 h-5 text-primary-500" />
        <span>تعديل معلومات الملف</span>
      </div>
    </template>

    <div class="p-6 space-y-5">
      <!-- Error message -->
      <div v-if="error" class="p-3 bg-danger-50 dark:bg-danger-900/20 text-danger-600 dark:text-danger-400 rounded-lg text-sm">
        {{ error }}
      </div>

      <!-- Current file info -->
      <div class="p-3 bg-muted-100 dark:bg-muted-800 rounded-lg">
        <p class="text-sm text-muted-500 mb-1">الملف الحالي</p>
        <p class="font-medium text-muted-800 dark:text-muted-100">{{ file?.fileName }}</p>
      </div>

      <!-- Archive File Name -->
      <div>
        <BaseInput
          v-model="form.archiveFileName"
          label="اسم الملف في الأرشيف"
          placeholder="أدخل اسم الملف"
        />
      </div>

      <!-- Description -->
      <div>
        <BaseTextarea
          v-model="form.description"
          label="الوصف (اختياري)"
          placeholder="أدخل وصف الملف"
          rows="2"
        />
      </div>

      <!-- Category Selection -->
      <div>
        <label class="block text-sm font-medium text-muted-700 dark:text-muted-300 mb-2">
          التصنيف
        </label>

        <!-- Current category -->
        <div v-if="selectedCategoryName && !showCategoryBrowser" class="mb-2 p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Icon name="ph:folder-duotone" class="w-4 h-4 text-amber-500" />
            <span class="text-sm text-primary-700 dark:text-primary-300">{{ selectedCategoryName }}</span>
          </div>
          <button
            type="button"
            class="text-xs text-primary-500 hover:text-primary-600"
            @click="showCategoryBrowser = true"
          >
            تغيير
          </button>
        </div>

        <!-- Category dropdown -->
        <BaseSelect
          v-if="!selectedCategoryName || showCategoryBrowser"
          v-model="form.categoryId"
          :loading="loadingCategories"
          @update:model-value="handleCategorySelect"
        >
          <option :value="undefined">اختر التصنيف</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ formatCategoryOption(cat) }}
          </option>
        </BaseSelect>
      </div>

      <!-- File Year -->
      <div>
        <label class="block text-sm font-medium text-muted-700 dark:text-muted-300 mb-2">
          سنة الملف
        </label>
        <BaseSelect v-model="form.fileYear">
          <option :value="undefined">اختر السنة</option>
          <option v-for="year in yearOptions" :key="year" :value="year">
            {{ year }}
          </option>
        </BaseSelect>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <BaseButton color="muted" @click="emit('close')">
          إلغاء
        </BaseButton>
        <BaseButton
          color="primary"
          :loading="saving"
          :disabled="saving"
          @click="handleSave"
        >
          <Icon name="ph:floppy-disk" class="w-4 h-4 ml-1" />
          حفظ التغييرات
        </BaseButton>
      </div>
    </template>
  </TairoModal>
</template>
