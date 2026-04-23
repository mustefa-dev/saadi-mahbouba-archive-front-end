<script setup lang="ts">
import type { UsersResponse } from '~/types/users'
import { UserRoles } from '~/types/enums'

useHead({ title: 'إرسال إشعار' })
definePageMeta({ title: 'إرسال إشعار' })

const apiPaths = useApiPaths()
const notifStore = useNotificationStore()

type TargetKind = 0 | 1 | 2 // 0 = specific user, 1 = all users, 2 = all admins

const title = ref('')
const body = ref('')
const type = ref<'general' | 'message' | 'report'>('general')
const targetKind = ref<TargetKind>(1)
const targetUserId = ref<string | null>(null)
const userSearch = ref('')

const sending = ref(false)
const resultMessage = ref<string | null>(null)
const resultIsError = ref(false)

// Lazy user search — only runs when targetKind === 0 and user types
const { data: usersData, pending: usersLoading } = await useFetch<UsersResponse>(
  apiPaths.users,
  {
    key: 'send-notification-user-search',
    lazy: true,
    server: false,
    query: computed(() => ({
      role: UserRoles.USER,
      fullName: userSearch.value,
      pageNumber: 1,
      pageSize: 20
    })),
    // Only fire when we need the list
    immediate: false,
    watch: [userSearch, targetKind]
  }
)

const userMatches = computed(() => usersData.value?.data ?? [])

const selectedUserLabel = computed(() => {
  if (!targetUserId.value) return null
  const u = userMatches.value.find(m => m.id === targetUserId.value)
  return u ? (u.companyName || u.fullName) : targetUserId.value
})

const canSend = computed(() => {
  if (!title.value.trim() || !body.value.trim()) return false
  if (targetKind.value === 0 && !targetUserId.value) return false
  return true
})

const resetForm = () => {
  title.value = ''
  body.value = ''
  type.value = 'general'
  targetKind.value = 1
  targetUserId.value = null
  userSearch.value = ''
}

const onTargetKindChange = () => {
  // Clear the selected user when leaving "specific user"
  if (targetKind.value !== 0) {
    targetUserId.value = null
    userSearch.value = ''
  }
}

const send = async () => {
  if (!canSend.value || sending.value) return
  sending.value = true
  resultMessage.value = null
  resultIsError.value = false

  try {
    const res = await notifStore.sendNotification({
      title: title.value.trim(),
      body: body.value.trim(),
      type: type.value,
      targetKind: targetKind.value,
      targetUserId: targetKind.value === 0 ? targetUserId.value : null
    })
    resultMessage.value = `تم الإرسال إلى ${res.persisted} مستلم (نجاح الدفع: ${res.pushSuccess}, فشل: ${res.pushFailure})`
    resultIsError.value = false
    resetForm()
  } catch (e: any) {
    resultIsError.value = true
    resultMessage.value = e?.data?.message || 'فشل إرسال الإشعار'
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div class="p-6 max-w-2xl mx-auto" dir="rtl">
    <div class="flex items-center gap-3 mb-6">
      <Icon name="ph:paper-plane-tilt-duotone" class="w-6 h-6 text-primary-500" />
      <BaseHeading size="xl" weight="medium">إرسال إشعار</BaseHeading>
    </div>

    <BaseCard class="p-6 space-y-5">
      <!-- Recipient type -->
      <div>
        <BaseParagraph size="sm" weight="medium" class="mb-2">المستلم</BaseParagraph>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <label
            class="cursor-pointer rounded-lg border p-3 text-sm transition-colors"
            :class="targetKind === 1
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-muted-200 dark:border-muted-700 hover:border-muted-300'"
          >
            <input type="radio" class="hidden" :value="1" v-model="targetKind" @change="onTargetKindChange" />
            <div class="flex items-center gap-2">
              <Icon name="ph:users-three-duotone" class="w-5 h-5" />
              <span>جميع المستخدمين</span>
            </div>
          </label>

          <label
            class="cursor-pointer rounded-lg border p-3 text-sm transition-colors"
            :class="targetKind === 2
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-muted-200 dark:border-muted-700 hover:border-muted-300'"
          >
            <input type="radio" class="hidden" :value="2" v-model="targetKind" @change="onTargetKindChange" />
            <div class="flex items-center gap-2">
              <Icon name="ph:shield-check-duotone" class="w-5 h-5" />
              <span>جميع المشرفين</span>
            </div>
          </label>

          <label
            class="cursor-pointer rounded-lg border p-3 text-sm transition-colors"
            :class="targetKind === 0
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-muted-200 dark:border-muted-700 hover:border-muted-300'"
          >
            <input type="radio" class="hidden" :value="0" v-model="targetKind" @change="onTargetKindChange" />
            <div class="flex items-center gap-2">
              <Icon name="ph:user-duotone" class="w-5 h-5" />
              <span>مستخدم محدد</span>
            </div>
          </label>
        </div>
      </div>

      <!-- User picker (only when specific user) -->
      <div v-if="targetKind === 0" class="space-y-2">
        <BaseParagraph size="sm" weight="medium">اختر المستخدم</BaseParagraph>
        <BaseInput
          v-model="userSearch"
          placeholder="ابحث باسم الشركة أو الاسم الكامل..."
          icon="ph:magnifying-glass-duotone"
        />
        <div
          v-if="userSearch"
          class="max-h-56 overflow-y-auto rounded-lg border border-muted-200 dark:border-muted-700"
        >
          <div v-if="usersLoading" class="p-3 text-sm text-muted-400 text-center">جاري البحث...</div>
          <div v-else-if="userMatches.length === 0" class="p-3 text-sm text-muted-400 text-center">
            لا نتائج
          </div>
          <button
            v-for="u in userMatches"
            :key="u.id"
            type="button"
            class="w-full text-right p-3 text-sm hover:bg-muted-50 dark:hover:bg-muted-800 transition-colors flex items-center justify-between"
            :class="targetUserId === u.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''"
            @click="targetUserId = u.id"
          >
            <div>
              <div class="font-medium text-muted-800 dark:text-white">{{ u.companyName || u.fullName }}</div>
              <div class="text-xs text-muted-400">{{ u.phoneNumber }}</div>
            </div>
            <Icon
              v-if="targetUserId === u.id"
              name="ph:check-circle-duotone"
              class="w-5 h-5 text-primary-500"
            />
          </button>
        </div>
        <div v-if="targetUserId" class="text-xs text-muted-500">
          المختار: <span class="font-medium">{{ selectedUserLabel }}</span>
        </div>
      </div>

      <!-- Type -->
      <div>
        <BaseParagraph size="sm" weight="medium" class="mb-2">التصنيف</BaseParagraph>
        <select
          v-model="type"
          class="w-full rounded-lg border border-muted-200 dark:border-muted-700 bg-white dark:bg-muted-800 px-3 py-2 text-sm"
        >
          <option value="general">عام</option>
          <option value="message">رسالة</option>
          <option value="report">تقرير</option>
        </select>
      </div>

      <!-- Title -->
      <BaseInput
        v-model="title"
        label="العنوان"
        placeholder="عنوان الإشعار"
        :maxlength="200"
      />

      <!-- Body -->
      <div>
        <BaseParagraph size="sm" weight="medium" class="mb-2">النص</BaseParagraph>
        <textarea
          v-model="body"
          rows="4"
          maxlength="1000"
          placeholder="محتوى الإشعار..."
          class="w-full rounded-lg border border-muted-200 dark:border-muted-700 bg-white dark:bg-muted-800 px-3 py-2 text-sm resize-none"
        />
        <div class="text-xs text-muted-400 mt-1 text-left">{{ body.length }} / 1000</div>
      </div>

      <!-- Result -->
      <div
        v-if="resultMessage"
        class="rounded-lg p-3 text-sm"
        :class="resultIsError
          ? 'bg-danger-50 text-danger-700 dark:bg-danger-900/20 dark:text-danger-300'
          : 'bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-300'"
      >
        {{ resultMessage }}
      </div>

      <!-- Send -->
      <div class="pt-2 flex justify-end">
        <BaseButton
          color="primary"
          :loading="sending"
          :disabled="!canSend"
          @click="send"
        >
          <Icon name="ph:paper-plane-tilt" class="w-4 h-4 ml-1" />
          <span>إرسال</span>
        </BaseButton>
      </div>
    </BaseCard>
  </div>
</template>
