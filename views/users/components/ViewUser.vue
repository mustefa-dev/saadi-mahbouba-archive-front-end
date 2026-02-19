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

    <TairoModal :open="isOpen" size="2xl" @close="isOpen = false">
      <template #header>
        <div class="flex w-full items-center justify-between p-4" dir="rtl">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Icon name="ph:buildings-duotone" class="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <h3 class="font-heading text-muted-900 text-base font-medium leading-6 dark:text-white">
                {{ user.companyName || user.fullName }}
              </h3>
              <p v-if="user.code" class="text-xs text-muted-400">{{ user.code }}</p>
            </div>
          </div>
          <BaseButtonClose @click="isOpen = false" />
        </div>
      </template>

      <div class="p-4 space-y-3 max-h-[65vh] overflow-y-auto" dir="rtl">
        <!-- Contact Information -->
        <div class="p-4 bg-muted-50 dark:bg-muted-900/50 border border-muted-200 dark:border-muted-700 rounded-lg">
          <h4 class="text-sm font-semibold text-muted-800 dark:text-muted-100 mb-3 pb-2 border-b border-muted-200 dark:border-muted-700">
            معلومات الاتصال
          </h4>

          <div class="grid grid-cols-2 gap-3">
            <!-- Full Name -->
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                <Icon name="ph:user-duotone" class="w-4 h-4 text-primary-500" />
              </div>
              <div class="min-w-0">
                <p class="text-[10px] text-muted-400">الاسم الكامل</p>
                <p class="text-sm font-medium text-muted-800 dark:text-muted-100 truncate">
                  {{ user.fullName || '-' }}
                </p>
              </div>
            </div>

            <!-- Email -->
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                <Icon name="ph:envelope-duotone" class="w-4 h-4 text-amber-500" />
              </div>
              <div class="min-w-0">
                <p class="text-[10px] text-muted-400">البريد الإلكتروني</p>
                <p class="text-sm font-medium text-muted-800 dark:text-muted-100 truncate" dir="ltr">
                  {{ user.email || '-' }}
                </p>
              </div>
            </div>

            <!-- Phone -->
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <Icon name="ph:phone-duotone" class="w-4 h-4 text-green-500" />
              </div>
              <div class="min-w-0">
                <p class="text-[10px] text-muted-400">رقم الهاتف</p>
                <p class="text-sm font-medium text-muted-800 dark:text-muted-100" dir="ltr">
                  {{ phoneNumberFormatter(user.phoneNumber) || '-' }}
                </p>
              </div>
            </div>

            <!-- Address -->
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <Icon name="ph:map-pin-duotone" class="w-4 h-4 text-blue-500" />
              </div>
              <div class="min-w-0">
                <p class="text-[10px] text-muted-400">العنوان</p>
                <p class="text-sm font-medium text-muted-800 dark:text-muted-100 truncate">
                  {{ user.address || '-' }}
                </p>
              </div>
            </div>

            <!-- Password -->
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
                <Icon name="ph:lock-duotone" class="w-4 h-4 text-rose-500" />
              </div>
              <div class="min-w-0">
                <p class="text-[10px] text-muted-400">كلمة المرور</p>
                <p class="text-sm font-medium text-muted-800 dark:text-muted-100 truncate" dir="ltr">
                  {{ user.passwordPlain || '-' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Manager Information -->
        <div class="p-4 bg-muted-50 dark:bg-muted-900/50 border border-muted-200 dark:border-muted-700 rounded-lg">
          <h4 class="text-sm font-semibold text-muted-800 dark:text-muted-100 mb-3 pb-2 border-b border-muted-200 dark:border-muted-700">
            المدير المفوض
          </h4>

          <div class="grid grid-cols-3 gap-3">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                <Icon name="ph:user-circle-duotone" class="w-4 h-4 text-violet-500" />
              </div>
              <div class="min-w-0">
                <p class="text-[10px] text-muted-400">الاسم</p>
                <p class="text-sm font-medium text-muted-800 dark:text-muted-100 truncate">
                  {{ user.managerName || '-' }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                <Icon name="ph:phone-duotone" class="w-4 h-4 text-violet-500" />
              </div>
              <div class="min-w-0">
                <p class="text-[10px] text-muted-400">رقم الهاتف</p>
                <p class="text-sm font-medium text-muted-800 dark:text-muted-100" dir="ltr">
                  {{ phoneNumberFormatter(user.managerPhone) || '-' }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                <Icon name="ph:phone-duotone" class="w-4 h-4 text-violet-500" />
              </div>
              <div class="min-w-0">
                <p class="text-[10px] text-muted-400">رقم ثانٍ</p>
                <p class="text-sm font-medium text-muted-800 dark:text-muted-100" dir="ltr">
                  {{ phoneNumberFormatter(user.managerPhoneSecondary) || '-' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Lawyer Information -->
        <div class="p-4 bg-muted-50 dark:bg-muted-900/50 border border-muted-200 dark:border-muted-700 rounded-lg">
          <h4 class="text-sm font-semibold text-muted-800 dark:text-muted-100 mb-3 pb-2 border-b border-muted-200 dark:border-muted-700">
            المحامي
          </h4>

          <div class="grid grid-cols-3 gap-3">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <Icon name="ph:scales-duotone" class="w-4 h-4 text-purple-500" />
              </div>
              <div class="min-w-0">
                <p class="text-[10px] text-muted-400">الاسم</p>
                <p class="text-sm font-medium text-muted-800 dark:text-muted-100 truncate">
                  {{ user.lawyerName || '-' }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <Icon name="ph:phone-duotone" class="w-4 h-4 text-purple-500" />
              </div>
              <div class="min-w-0">
                <p class="text-[10px] text-muted-400">رقم الهاتف</p>
                <p class="text-sm font-medium text-muted-800 dark:text-muted-100" dir="ltr">
                  {{ phoneNumberFormatter(user.lawyerPhone) || '-' }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <Icon name="ph:phone-duotone" class="w-4 h-4 text-purple-500" />
              </div>
              <div class="min-w-0">
                <p class="text-[10px] text-muted-400">رقم ثانٍ</p>
                <p class="text-sm font-medium text-muted-800 dark:text-muted-100" dir="ltr">
                  {{ phoneNumberFormatter(user.lawyerPhoneSecondary) || '-' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Accountant Information -->
        <div class="p-4 bg-muted-50 dark:bg-muted-900/50 border border-muted-200 dark:border-muted-700 rounded-lg">
          <h4 class="text-sm font-semibold text-muted-800 dark:text-muted-100 mb-3 pb-2 border-b border-muted-200 dark:border-muted-700">
            المحاسب
          </h4>

          <div class="grid grid-cols-3 gap-3">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
                <Icon name="ph:bank-duotone" class="w-4 h-4 text-teal-500" />
              </div>
              <div class="min-w-0">
                <p class="text-[10px] text-muted-400">الاسم</p>
                <p class="text-sm font-medium text-muted-800 dark:text-muted-100 truncate">
                  {{ user.accountantName || '-' }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
                <Icon name="ph:phone-duotone" class="w-4 h-4 text-teal-500" />
              </div>
              <div class="min-w-0">
                <p class="text-[10px] text-muted-400">رقم الهاتف</p>
                <p class="text-sm font-medium text-muted-800 dark:text-muted-100" dir="ltr">
                  {{ phoneNumberFormatter(user.accountantPhone) || '-' }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
                <Icon name="ph:phone-duotone" class="w-4 h-4 text-teal-500" />
              </div>
              <div class="min-w-0">
                <p class="text-[10px] text-muted-400">رقم ثانٍ</p>
                <p class="text-sm font-medium text-muted-800 dark:text-muted-100" dir="ltr">
                  {{ phoneNumberFormatter(user.accountantPhoneSecondary) || '-' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Registration Details -->
        <div class="p-4 bg-muted-50 dark:bg-muted-900/50 border border-muted-200 dark:border-muted-700 rounded-lg">
          <h4 class="text-sm font-semibold text-muted-800 dark:text-muted-100 mb-3 pb-2 border-b border-muted-200 dark:border-muted-700">
            تفاصيل التسجيل
          </h4>

          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
              <Icon name="ph:calendar-duotone" class="w-4 h-4 text-rose-500" />
            </div>
            <div>
              <p class="text-[10px] text-muted-400">تاريخ التسجيل</p>
              <p class="text-sm font-medium text-muted-800 dark:text-muted-100">
                {{ formatHijriDate(user.creationDate) }} هـ
              </p>
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

<style scoped>
/* Custom scrollbar for the modal content */
.max-h-\[65vh\]::-webkit-scrollbar {
  width: 6px;
}
.max-h-\[65vh\]::-webkit-scrollbar-track {
  background: transparent;
}
.max-h-\[65vh\]::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.4);
  border-radius: 3px;
}
.max-h-\[65vh\]::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.6);
}
</style>
