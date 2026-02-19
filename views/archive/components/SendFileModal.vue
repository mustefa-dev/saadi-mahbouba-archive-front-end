<script setup lang="ts">
import type { CompanyArchive } from '~/types/archive'

const props = defineProps<{
  open: boolean
  company: CompanyArchive | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

const apiPaths = useApiPaths()

// Form state
const title = ref('')
const selectedCategoryId = ref<string | undefined>()
const fileYear = ref<number>(new Date().getFullYear())
const file = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

// Loading state
const isSubmitting = ref(false)
const error = ref<string | null>(null)

// Year options: from 2000 to (current year + 3)
const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: currentYear + 3 - 2000 + 1 }, (_, i) => currentYear + 3 - i)

// Reset form when modal opens/closes
watch(() => props.open, (isOpen) => {
  if (!isOpen) {
    resetForm()
  }
})

const resetForm = () => {
  title.value = ''
  selectedCategoryId.value = undefined
  fileYear.value = currentYear
  file.value = null
  error.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Extract filename without extension
const getFileNameWithoutExtension = (fileName: string): string => {
  const lastDot = fileName.lastIndexOf('.')
  return lastDot > 0 ? fileName.substring(0, lastDot) : fileName
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    file.value = target.files[0]
    // Auto-fill title from filename
    if (!title.value.trim()) {
      title.value = getFileNameWithoutExtension(target.files[0].name)
    }
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    file.value = event.dataTransfer.files[0]
    // Auto-fill title from filename
    if (!title.value.trim()) {
      title.value = getFileNameWithoutExtension(event.dataTransfer.files[0].name)
    }
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
}

const removeFile = () => {
  file.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleSubmit = async () => {
  if (!props.company || !file.value || !title.value.trim()) {
    error.value = 'يرجى ملء جميع الحقول المطلوبة'
    return
  }

  isSubmitting.value = true
  error.value = null

  try {
    const formData = new FormData()
    formData.append('UserId', props.company.userId)
    formData.append('Title', title.value.trim())
    formData.append('File', file.value)

    if (selectedCategoryId.value) {
      formData.append('CategoryId', selectedCategoryId.value)
    }
    if (fileYear.value) {
      formData.append('FileYear', fileYear.value.toString())
    }

    await $fetch(apiPaths.archiveSendFile, {
      method: 'POST',
      body: formData
    })

    emit('success')
    emit('close')
  } catch (err: any) {
    console.error('Error sending file:', err)
    error.value = err.data?.error || 'حدث خطأ أثناء إرسال الملف'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <TairoModal :open="open" size="lg" @close="emit('close')">
    <template #header>
      <div class="flex items-center justify-between p-4 border-b border-muted-200 dark:border-muted-700" dir="rtl">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Icon name="ph:file-arrow-up-duotone" class="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <h3 class="font-semibold text-muted-800 dark:text-muted-100">إرسال ملف</h3>
            <p v-if="company" class="text-sm text-muted-400">
              إلى: {{ company.companyName || company.fullName }}
            </p>
          </div>
        </div>
        <BaseButtonIcon size="sm" rounded="full" @click="emit('close')">
          <Icon name="ph:x" class="w-4 h-4" />
        </BaseButtonIcon>
      </div>
    </template>

    <div class="p-6 space-y-6" dir="rtl">
      <!-- Error Message -->
      <div v-if="error" class="p-4 bg-danger-100 dark:bg-danger-900/30 border border-danger-200 dark:border-danger-800 rounded-lg">
        <div class="flex items-center gap-2 text-danger-600 dark:text-danger-400">
          <Icon name="ph:warning-circle" class="w-5 h-5" />
          <span>{{ error }}</span>
        </div>
      </div>

      <!-- File Upload -->
      <div>
        <label class="block text-sm font-medium text-muted-700 dark:text-muted-300 mb-2">
          الملف <span class="text-danger-500">*</span>
        </label>
        <div
          v-if="!file"
          class="border-2 border-dashed border-muted-300 dark:border-muted-600 rounded-xl p-8 text-center cursor-pointer hover:border-primary-500 transition-colors"
          @click="fileInput?.click()"
          @drop="handleDrop"
          @dragover="handleDragOver"
        >
          <Icon name="ph:cloud-arrow-up-duotone" class="w-12 h-12 text-muted-400 mx-auto mb-3" />
          <p class="text-muted-600 dark:text-muted-300 mb-1">اسحب الملف هنا أو اضغط للاختيار</p>
          <p class="text-sm text-muted-400">PDF, DOCX, XLSX, الصور (حتى 10MB)</p>
        </div>
        <div
          v-else
          class="flex items-center gap-4 p-4 bg-muted-100 dark:bg-muted-800 rounded-xl"
        >
          <div class="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Icon name="ph:file-duotone" class="w-6 h-6 text-primary-500" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-muted-800 dark:text-muted-100 truncate">{{ file.name }}</p>
            <p class="text-sm text-muted-400">{{ formatFileSize(file.size) }}</p>
          </div>
          <BaseButtonIcon size="sm" rounded="full" @click="removeFile">
            <Icon name="ph:x" class="w-4 h-4" />
          </BaseButtonIcon>
        </div>
        <input
          ref="fileInput"
          type="file"
          class="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif"
          @change="handleFileChange"
        />
      </div>

      <!-- Title -->
      <div>
        <label class="block text-sm font-medium text-muted-700 dark:text-muted-300 mb-2">
          عنوان الملف <span class="text-danger-500">*</span>
        </label>
        <BaseInput
          v-model="title"
          placeholder="أدخل عنوان الملف..."
          :classes="{ wrapper: 'w-full' }"
        />
      </div>

      <!-- Category & Year -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-muted-700 dark:text-muted-300 mb-2">
            التصنيف
          </label>
          <CategorySelector
            v-model="selectedCategoryId"
            placeholder="اختر التصنيف..."
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-muted-700 dark:text-muted-300 mb-2">
            السنة
          </label>
          <BaseSelect v-model="fileYear" :classes="{ wrapper: 'w-full' }">
            <option v-for="year in yearOptions" :key="year" :value="year">
              {{ year }}
            </option>
          </BaseSelect>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-3 p-4 border-t border-muted-200 dark:border-muted-700" dir="rtl">
        <BaseButton color="muted" @click="emit('close')">
          إلغاء
        </BaseButton>
        <BaseButton
          color="primary"
          :loading="isSubmitting"
          :disabled="!file || !title.trim()"
          @click="handleSubmit"
        >
          <Icon name="ph:paper-plane-tilt" class="w-4 h-4 ml-2" />
          إرسال الملف
        </BaseButton>
      </div>
    </template>
  </TairoModal>
</template>
