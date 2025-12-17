<script setup lang="ts">
import type { CompanyDetails } from '~/types/archive'

const props = defineProps<{
  details: CompanyDetails | null
  loading: boolean
}>()

const formatHijriDate = (dateString: string) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  } catch {
    return dateString
  }
}
</script>

<template>
  <div class="w-full space-y-6">
    <!-- Loading State -->
    <template v-if="loading">
      <div v-for="i in 3" :key="i" class="p-6 bg-muted-100 dark:bg-muted-800 rounded-xl animate-pulse">
        <div class="h-5 bg-muted-200 dark:bg-muted-700 rounded w-1/4 mb-4"></div>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <div class="h-3 bg-muted-200 dark:bg-muted-700 rounded w-1/3"></div>
            <div class="h-4 bg-muted-200 dark:bg-muted-700 rounded w-2/3"></div>
          </div>
          <div class="space-y-2">
            <div class="h-3 bg-muted-200 dark:bg-muted-700 rounded w-1/3"></div>
            <div class="h-4 bg-muted-200 dark:bg-muted-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    </template>

    <!-- No Data State -->
    <div v-else-if="!details" class="flex flex-col items-center justify-center py-16 text-muted-400">
      <Icon name="ph:info-duotone" class="w-16 h-16 mb-4" />
      <p class="text-lg">لا تتوفر معلومات الشركة</p>
    </div>

    <!-- Company Info -->
    <template v-else>
      <!-- Contact Information -->
      <div class="p-6 bg-white dark:bg-muted-800 border border-muted-200 dark:border-muted-700 rounded-xl">
        <h3 class="text-lg font-semibold text-muted-800 dark:text-muted-100 mb-6 pb-3 border-b border-muted-200 dark:border-muted-700">
          معلومات الاتصال
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Email -->
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
              <Icon name="ph:envelope-duotone" class="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <p class="text-sm text-muted-400 mb-1">البريد الإلكتروني</p>
              <p class="font-medium text-muted-800 dark:text-muted-100" dir="ltr">
                {{ details.email || '-' }}
              </p>
            </div>
          </div>

          <!-- Manager -->
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
              <Icon name="ph:user-duotone" class="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p class="text-sm text-muted-400 mb-1">المدير</p>
              <p class="font-medium text-muted-800 dark:text-muted-100">
                {{ details.managerName || '-' }}
              </p>
            </div>
          </div>

          <!-- Address -->
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
              <Icon name="ph:map-pin-duotone" class="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p class="text-sm text-muted-400 mb-1">العنوان</p>
              <p class="font-medium text-muted-800 dark:text-muted-100">
                {{ details.address || '-' }}
              </p>
            </div>
          </div>

          <!-- Phone -->
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <Icon name="ph:phone-duotone" class="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p class="text-sm text-muted-400 mb-1">الهاتف</p>
              <p class="font-medium text-muted-800 dark:text-muted-100" dir="ltr">
                {{ details.phoneNumber || '-' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Professional Team -->
      <div class="p-6 bg-white dark:bg-muted-800 border border-muted-200 dark:border-muted-700 rounded-xl">
        <h3 class="text-lg font-semibold text-muted-800 dark:text-muted-100 mb-6 pb-3 border-b border-muted-200 dark:border-muted-700">
          الفريق المهني
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Lawyer -->
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
              <Icon name="ph:scales-duotone" class="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p class="text-sm text-muted-400 mb-1">المحامي</p>
              <p class="font-medium text-muted-800 dark:text-muted-100">
                {{ details.lawyerName || '-' }}
              </p>
            </div>
          </div>

          <!-- Accountant -->
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
              <Icon name="ph:bank-duotone" class="w-6 h-6 text-teal-500" />
            </div>
            <div>
              <p class="text-sm text-muted-400 mb-1">المحاسب</p>
              <p class="font-medium text-muted-800 dark:text-muted-100">
                {{ details.accountantName || '-' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Registration Details -->
      <div class="p-6 bg-white dark:bg-muted-800 border border-muted-200 dark:border-muted-700 rounded-xl">
        <h3 class="text-lg font-semibold text-muted-800 dark:text-muted-100 mb-6 pb-3 border-b border-muted-200 dark:border-muted-700">
          تفاصيل التسجيل
        </h3>

        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
            <Icon name="ph:calendar-duotone" class="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <p class="text-sm text-muted-400 mb-1">تاريخ التسجيل</p>
            <p class="font-medium text-muted-800 dark:text-muted-100">
              {{ formatHijriDate(details.registrationDate) }} هـ
            </p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
