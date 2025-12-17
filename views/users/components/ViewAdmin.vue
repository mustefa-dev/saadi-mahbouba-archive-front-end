<script setup lang="ts">
import type { User } from '~/types/users';
import { phoneNumberFormatter } from '~/utils/helpers';

const props = defineProps<{
  user: User;
}>();

const isOpen = ref(false);

const formatHijriDate = (dateString?: string) => {
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
  <div>
    <BaseButton
      size="sm"
      color="info"
      variant="pastel"
      data-nui-tooltip="عرض التفاصيل"
      @click="isOpen = true"
    >
      <Icon name="ph:eye" class="size-4" />
    </BaseButton>

    <TairoModal :open="isOpen" size="lg" @close="isOpen = false">
      <template #header>
        <div class="flex w-full items-center justify-between p-4" dir="rtl">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Icon name="ph:user-circle-duotone" class="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <h3 class="font-heading text-muted-900 text-base font-medium leading-6 dark:text-white">
                {{ user.fullName }}
              </h3>
              <p class="text-xs text-muted-400">مشرف</p>
            </div>
          </div>
          <BaseButtonClose @click="isOpen = false" />
        </div>
      </template>

      <div class="p-4 space-y-4" dir="rtl">
        <!-- Admin Information -->
        <div class="p-4 bg-muted-50 dark:bg-muted-900/50 border border-muted-200 dark:border-muted-700 rounded-lg">
          <h4 class="text-sm font-semibold text-muted-800 dark:text-muted-100 mb-4 pb-2 border-b border-muted-200 dark:border-muted-700">
            معلومات المشرف
          </h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Full Name -->
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                <Icon name="ph:user-duotone" class="w-5 h-5 text-primary-500" />
              </div>
              <div class="min-w-0">
                <p class="text-xs text-muted-400">الاسم الكامل</p>
                <p class="text-sm font-medium text-muted-800 dark:text-muted-100">
                  {{ user.fullName || '-' }}
                </p>
              </div>
            </div>

            <!-- Phone -->
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <Icon name="ph:phone-duotone" class="w-5 h-5 text-green-500" />
              </div>
              <div class="min-w-0">
                <p class="text-xs text-muted-400">رقم الهاتف</p>
                <p class="text-sm font-medium text-muted-800 dark:text-muted-100" dir="ltr">
                  {{ phoneNumberFormatter(user.phoneNumber) || '-' }}
                </p>
              </div>
            </div>

            <!-- Email -->
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                <Icon name="ph:envelope-duotone" class="w-5 h-5 text-amber-500" />
              </div>
              <div class="min-w-0">
                <p class="text-xs text-muted-400">البريد الإلكتروني</p>
                <p class="text-sm font-medium text-muted-800 dark:text-muted-100" dir="ltr">
                  {{ user.email || '-' }}
                </p>
              </div>
            </div>

            <!-- Registration Date -->
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
                <Icon name="ph:calendar-duotone" class="w-5 h-5 text-rose-500" />
              </div>
              <div class="min-w-0">
                <p class="text-xs text-muted-400">تاريخ الإنشاء</p>
                <p class="text-sm font-medium text-muted-800 dark:text-muted-100">
                  {{ formatHijriDate(user.creationDate) }} هـ
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-start p-3 border-t border-muted-200 dark:border-muted-700" dir="rtl">
          <BaseButton color="default" size="sm" @click="isOpen = false">
            إغلاق
          </BaseButton>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
