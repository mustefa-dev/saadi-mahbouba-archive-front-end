<script setup lang="ts">
import { useNotificationStore } from '~/stores/notification'
import type { AppNotification } from '~/stores/notification'

const notifStore = useNotificationStore()

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'message': return 'ph:chat-circle-duotone'
    case 'report': return 'ph:file-text-duotone'
    default: return 'ph:bell-duotone'
  }
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'message': return 'رسالة'
    case 'report': return 'تقرير'
    default: return 'عام'
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'message': return 'primary'
    case 'report': return 'success'
    default: return 'info'
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  try {
    return new Intl.DateTimeFormat('en-GB', {
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

const handleClick = async (n: AppNotification) => {
  if (!n.isRead) {
    await notifStore.markAsRead(n.id)
  }
}

onMounted(() => {
  notifStore.fetchNotifications(true)
})
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto" dir="rtl">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <Icon name="ph:bell-duotone" class="w-6 h-6 text-primary-500" />
        <BaseHeading size="xl" weight="medium">الإشعارات</BaseHeading>
        <BaseTag v-if="notifStore.unreadCount > 0" color="primary" size="sm" flavor="pastel">
          {{ notifStore.unreadCount }} غير مقروء
        </BaseTag>
      </div>
      <BaseButton
        v-if="notifStore.unreadCount > 0"
        color="primary"
        variant="pastel"
        size="sm"
        @click="notifStore.markAllAsRead()"
      >
        <Icon name="ph:checks" class="w-4 h-4" />
        <span>قراءة الكل</span>
      </BaseButton>
    </div>

    <!-- Loading -->
    <div v-if="notifStore.loading && notifStore.notifications.length === 0" class="space-y-3">
      <BasePlaceload v-for="_ in 5" :key="_" class="h-20 w-full rounded-lg" />
    </div>

    <!-- Empty -->
    <div v-else-if="notifStore.notifications.length === 0" class="py-20 text-center">
      <Icon name="ph:bell-slash-duotone" class="w-16 h-16 mx-auto text-muted-300 mb-4" />
      <BaseParagraph class="text-muted-400">لا توجد إشعارات</BaseParagraph>
    </div>

    <!-- Notifications List -->
    <div v-else class="space-y-2">
      <div
        v-for="n in notifStore.notifications"
        :key="n.id"
        class="flex items-start gap-4 p-4 rounded-lg border transition-colors cursor-pointer"
        :class="n.isRead
          ? 'bg-white dark:bg-muted-800 border-muted-200 dark:border-muted-700'
          : 'bg-primary-50/50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800'"
        @click="handleClick(n)"
      >
        <!-- Icon -->
        <div
          class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
          :class="n.type === 'message'
            ? 'bg-primary-100 dark:bg-primary-900/30'
            : n.type === 'report'
              ? 'bg-success-100 dark:bg-success-900/30'
              : 'bg-muted-100 dark:bg-muted-700'"
        >
          <Icon
            :name="getTypeIcon(n.type)"
            class="w-5 h-5"
            :class="n.type === 'message'
              ? 'text-primary-500'
              : n.type === 'report'
                ? 'text-success-500'
                : 'text-muted-500'"
          />
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <h4 class="font-semibold text-muted-800 dark:text-white text-sm">
              {{ n.title }}
            </h4>
            <BaseTag :color="getTypeColor(n.type)" size="sm" flavor="pastel">
              {{ getTypeLabel(n.type) }}
            </BaseTag>
          </div>
          <p class="text-sm text-muted-500 dark:text-muted-400">
            {{ n.description }}
          </p>
          <p class="text-xs text-muted-400 mt-1">
            {{ formatDate(n.createdAt) }}
          </p>
        </div>

        <!-- Unread dot -->
        <div v-if="!n.isRead" class="flex-shrink-0 mt-2">
          <span class="w-2.5 h-2.5 rounded-full bg-primary-500 block"></span>
        </div>
      </div>

      <!-- Load More -->
      <div v-if="notifStore.hasMore" class="pt-4 text-center">
        <BaseButton
          color="default"
          :loading="notifStore.loading"
          @click="notifStore.loadMore()"
        >
          تحميل المزيد
        </BaseButton>
      </div>
    </div>
  </div>
</template>
