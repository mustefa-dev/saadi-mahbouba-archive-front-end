<script setup lang="ts">
import type { ArchiveFile, ArchiveFileFilter } from '~/types/archive'

const props = defineProps<{
  files: ArchiveFile[]
  loading: boolean
  totalCount: number
  folderTitle: string
  isClientFiles?: boolean // True if viewing client files (enables resend button)
}>()

const emit = defineEmits<{
  (e: 'filter', filter: ArchiveFileFilter): void
  (e: 'view', file: ArchiveFile): void
  (e: 'download', file: ArchiveFile): void
  (e: 'resend', file: ArchiveFile): void
  (e: 'edit', file: ArchiveFile): void
  (e: 'toggleVisibility', file: ArchiveFile): void
}>()

// Filter state
const search = ref('')
const selectedCategoryId = ref<string | undefined>()
const selectedYear = ref<number | undefined>()
const sortOrder = ref<'asc' | 'desc'>('desc')

// Year options: from 2000 to (current year + 3)
const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: currentYear + 3 - 2000 + 1 }, (_, i) => currentYear + 3 - i)

// Toggle visibility confirmation
const showVisibilityConfirm = ref(false)
const fileToToggle = ref<ArchiveFile | null>(null)

const openVisibilityConfirm = (file: ArchiveFile) => {
  fileToToggle.value = file
  showVisibilityConfirm.value = true
}

const confirmToggleVisibility = () => {
  if (fileToToggle.value) {
    emit('toggleVisibility', fileToToggle.value)
  }
  showVisibilityConfirm.value = false
  fileToToggle.value = null
}

const cancelToggleVisibility = () => {
  showVisibilityConfirm.value = false
  fileToToggle.value = null
}

// Watch for filter changes with debounce
watchDebounced([search, selectedCategoryId, selectedYear, sortOrder], () => {
  emit('filter', {
    search: search.value || undefined,
    categoryId: selectedCategoryId.value,
    year: selectedYear.value,
    sortOrder: sortOrder.value
  })
}, { debounce: 300 })

const formatHijriDate = (dateString: string) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    }).format(date)
  } catch {
    return dateString
  }
}

const getFileTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    PDF: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    DOCX: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    XLSX: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    IMG: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
  }
  return colors[type] || 'bg-muted-100 text-muted-600 dark:bg-muted-700 dark:text-muted-300'
}

const toggleSort = () => {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
}
</script>

<template>
  <div class="w-full space-y-4">
    <!-- Filters Section -->
    <div class="p-4 bg-muted-50 dark:bg-muted-800/50 rounded-xl border border-muted-200 dark:border-muted-700">
      <div class="flex items-center gap-2 mb-4 text-muted-600 dark:text-muted-300">
        <Icon name="ph:funnel-duotone" class="w-5 h-5" />
        <span class="font-medium">البحث والفلاتر</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Search -->
        <BaseInput
          v-model="search"
          icon="ph:magnifying-glass"
          placeholder="ابحث باسم الملف..."
          :classes="{ wrapper: 'w-full' }"
        />

        <!-- Category Selector (Tree-based like add/edit) -->
        <CategorySelector
          v-model="selectedCategoryId"
          placeholder="اختر التصنيف..."
        />

        <!-- Year -->
        <BaseSelect
          v-model="selectedYear"
          :classes="{ wrapper: 'w-full' }"
        >
          <option :value="undefined">جميع السنوات</option>
          <option v-for="year in yearOptions" :key="year" :value="year">
            {{ year }}
          </option>
        </BaseSelect>
      </div>

      <!-- Sort Button -->
      <div class="mt-4 flex items-center gap-4">
        <button
          class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-muted-800 border border-muted-200 dark:border-muted-700 rounded-lg hover:bg-muted-50 dark:hover:bg-muted-700 transition-colors"
          @click="toggleSort"
        >
          <Icon :name="sortOrder === 'desc' ? 'ph:sort-descending' : 'ph:sort-ascending'" class="w-5 h-5" />
          <span>ترتيب حسب التاريخ</span>
        </button>
      </div>
    </div>

    <!-- Files Count -->
    <div class="text-sm text-muted-500 dark:text-muted-400">
      {{ totalCount }} ملف
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 5" :key="i" class="flex items-center gap-4 p-4 bg-muted-100 dark:bg-muted-800 rounded-lg animate-pulse">
        <div class="w-10 h-10 bg-muted-200 dark:bg-muted-700 rounded"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-muted-200 dark:bg-muted-700 rounded w-1/3"></div>
          <div class="h-3 bg-muted-200 dark:bg-muted-700 rounded w-1/4"></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!files.length" class="flex flex-col items-center justify-center py-16 text-muted-400">
      <Icon name="ph:file-dashed-duotone" class="w-16 h-16 mb-4" />
      <p class="text-lg">لا توجد ملفات</p>
    </div>

    <!-- Files Table -->
    <table v-else class="w-full">
      <thead>
        <tr class="border-b border-muted-200 dark:border-muted-700">
          <th class="py-3 px-4 text-right text-sm font-medium text-muted-500 dark:text-muted-400">اسم الملف</th>
          <th class="py-3 px-4 text-center text-sm font-medium text-muted-500 dark:text-muted-400">النوع</th>
          <th class="py-3 px-4 text-right text-sm font-medium text-muted-500 dark:text-muted-400">التصنيف</th>
          <th class="py-3 px-4 text-right text-sm font-medium text-muted-500 dark:text-muted-400">تاريخ الأرشفة</th>
          <th class="py-3 px-4 text-right text-sm font-medium text-muted-500 dark:text-muted-400">المرسل</th>
          <th class="py-3 px-4 text-center text-sm font-medium text-muted-500 dark:text-muted-400">مرئي للعميل</th>
          <th class="py-3 px-4 text-center text-sm font-medium text-muted-500 dark:text-muted-400">الإجراء</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="file in files"
          :key="file.id"
          class="border-b border-muted-100 dark:border-muted-800 hover:bg-muted-50 dark:hover:bg-muted-800/50 transition-colors"
        >
          <td class="py-4 px-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-muted-100 dark:bg-muted-700 flex items-center justify-center">
                <Icon name="ph:file-text-duotone" class="w-5 h-5 text-muted-500" />
              </div>
              <span class="font-medium text-muted-800 dark:text-muted-100">{{ file.fileName }}</span>
            </div>
          </td>
          <td class="py-4 px-4 text-center">
            <span :class="['px-3 py-1 rounded-full text-xs font-medium', getFileTypeColor(file.fileType)]">
              {{ file.fileType }}
            </span>
          </td>
          <td class="py-4 px-4">
            <div class="text-sm">
              <p v-if="file.categoryPath" class="text-muted-600 dark:text-muted-300 text-xs">
                {{ file.categoryPath }}
              </p>
              <p v-else-if="file.categoryName" class="text-muted-800 dark:text-muted-200">
                {{ file.categoryName }}
              </p>
              <p v-else class="text-muted-400">-</p>
            </div>
          </td>
          <td class="py-4 px-4 text-muted-500 dark:text-muted-400 text-sm">
            {{ formatHijriDate(file.archivedAt) }} هـ
          </td>
          <td class="py-4 px-4 text-muted-600 dark:text-muted-300">
            {{ file.senderName || '-' }}
          </td>
          <!-- Visibility Toggle Switch -->
          <td class="py-4 px-4">
            <div class="flex items-center justify-center">
              <BaseSwitchBall
                :model-value="file.isVisibleToClient"
                :color="file.isVisibleToClient ? 'success' : 'danger'"
                @update:model-value="openVisibilityConfirm(file)"
              />
            </div>
          </td>
          <td class="py-4 px-4">
            <div class="flex items-center justify-center gap-2">
              <BaseButtonIcon
                size="sm"
                rounded="lg"
                data-nui-tooltip="عرض"
                @click="emit('view', file)"
              >
                <Icon name="ph:eye" class="w-4 h-4" />
              </BaseButtonIcon>
              <BaseButtonIcon
                size="sm"
                rounded="lg"
                data-nui-tooltip="تحميل"
                @click="emit('download', file)"
              >
                <Icon name="ph:download-simple" class="w-4 h-4" />
              </BaseButtonIcon>
              <!-- Edit button -->
              <BaseButtonIcon
                size="sm"
                rounded="lg"
                data-nui-tooltip="تعديل"
                @click="emit('edit', file)"
              >
                <Icon name="ph:pencil-simple" class="w-4 h-4" />
              </BaseButtonIcon>
              <!-- Resend to Management button (only for client files) -->
              <BaseButtonIcon
                v-if="isClientFiles"
                size="sm"
                rounded="lg"
                color="primary"
                data-nui-tooltip="إعادة إرسال لملفات الإدارة"
                @click="emit('resend', file)"
              >
                <Icon name="ph:arrow-bend-up-right" class="w-4 h-4" />
              </BaseButtonIcon>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Visibility Toggle Confirmation Dialog -->
    <TairoModal :open="showVisibilityConfirm" size="sm" @close="cancelToggleVisibility">
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6" dir="rtl">
          <h3 class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white">
            تأكيد تغيير الرؤية
          </h3>
          <BaseButtonClose @click="cancelToggleVisibility" />
        </div>
      </template>

      <div class="p-4 md:p-6" dir="rtl">
        <div class="mx-auto w-full text-center">
          <div class="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            :class="fileToToggle?.isVisibleToClient
              ? 'bg-danger-100 dark:bg-danger-900/30'
              : 'bg-success-100 dark:bg-success-900/30'"
          >
            <Icon
              :name="fileToToggle?.isVisibleToClient ? 'ph:eye-slash-duotone' : 'ph:eye-duotone'"
              class="w-8 h-8"
              :class="fileToToggle?.isVisibleToClient ? 'text-danger-500' : 'text-success-500'"
            />
          </div>

          <p class="text-muted-500 dark:text-muted-400 mb-2">
            {{ fileToToggle?.isVisibleToClient ? 'هل تريد إخفاء هذا الملف عن العميل؟' : 'هل تريد إظهار هذا الملف للعميل؟' }}
          </p>
          <p class="text-muted-900 dark:text-white font-semibold mb-6">
            {{ fileToToggle?.fileName }}
          </p>

          <div class="flex gap-x-2 justify-center">
            <BaseButton
              color="default"
              @click="cancelToggleVisibility"
            >
              إلغاء
            </BaseButton>
            <BaseButton
              :color="fileToToggle?.isVisibleToClient ? 'danger' : 'success'"
              @click="confirmToggleVisibility"
            >
              {{ fileToToggle?.isVisibleToClient ? 'إخفاء الملف' : 'إظهار الملف' }}
            </BaseButton>
          </div>
        </div>
      </div>
    </TairoModal>
  </div>
</template>
