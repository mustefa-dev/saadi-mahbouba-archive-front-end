<script setup lang="ts">
import type { CompanyArchive } from '~/types/archive'

const props = defineProps<{
  companies: CompanyArchive[]
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'select', company: CompanyArchive): void
}>()

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
</script>

<template>
  <div class="w-full">
    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 5" :key="i" class="flex items-center gap-4 p-4 bg-muted-100 dark:bg-muted-800 rounded-lg animate-pulse">
        <div class="w-10 h-10 bg-muted-200 dark:bg-muted-700 rounded"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-muted-200 dark:bg-muted-700 rounded w-1/3"></div>
          <div class="h-3 bg-muted-200 dark:bg-muted-700 rounded w-1/4"></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!companies.length" class="flex flex-col items-center justify-center py-16 text-muted-400">
      <Icon name="ph:folder-open-duotone" class="w-16 h-16 mb-4" />
      <p class="text-lg">لا توجد شركات في الأرشيف</p>
    </div>

    <!-- Table -->
    <table v-else class="w-full">
      <thead>
        <tr class="border-b border-muted-200 dark:border-muted-700">
          <th class="py-3 px-4 text-right text-sm font-medium text-muted-500 dark:text-muted-400">الاسم</th>
          <th class="py-3 px-4 text-center text-sm font-medium text-muted-500 dark:text-muted-400">التصنيفات الفرعية</th>
          <th class="py-3 px-4 text-center text-sm font-medium text-muted-500 dark:text-muted-400">عدد الملفات</th>
          <th class="py-3 px-4 text-right text-sm font-medium text-muted-500 dark:text-muted-400">تاريخ الإنشاء</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="company in companies"
          :key="company.userId"
          class="border-b border-muted-100 dark:border-muted-800 hover:bg-muted-50 dark:hover:bg-muted-800/50 cursor-pointer transition-colors"
          @click="emit('select', company)"
        >
          <td class="py-4 px-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Icon name="ph:folder-duotone" class="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p class="font-medium text-muted-800 dark:text-muted-100">{{ company.companyName || company.fullName }}</p>
                <p v-if="company.code" class="text-xs text-muted-400">{{ company.code }}</p>
              </div>
            </div>
          </td>
          <td class="py-4 px-4 text-center text-muted-600 dark:text-muted-300">
            {{ company.subCategoriesCount }}
          </td>
          <td class="py-4 px-4 text-center text-muted-600 dark:text-muted-300">
            {{ company.clientFilesCount + company.managementFilesCount }}
          </td>
          <td class="py-4 px-4 text-right text-muted-500 dark:text-muted-400 text-sm">
            {{ formatHijriDate(company.createdAt) }} هـ
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
