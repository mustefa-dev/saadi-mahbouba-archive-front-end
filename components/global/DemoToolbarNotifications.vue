<script setup lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { useNotificationStore } from '~/stores/notification'
import type { AppNotification } from '~/stores/notification'

const notifStore = useNotificationStore()
const signalR = useSignalR()

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'message': return 'ph:chat-circle-duotone'
    case 'report': return 'ph:file-text-duotone'
    default: return 'ph:bell-duotone'
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'message': return 'text-primary-500'
    case 'report': return 'text-success-500'
    default: return 'text-muted-500'
  }
}

const formatTime = (dateStr: string) => {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'الآن'
    if (mins < 60) return `${mins} د`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} س`
    return new Intl.DateTimeFormat('en-GB', { month: 'numeric', day: 'numeric' }).format(date)
  } catch {
    return ''
  }
}

const handleNotificationClick = async (notification: AppNotification) => {
  if (!notification.isRead) {
    await notifStore.markAsRead(notification.id)
  }
}

onMounted(async () => {
  await notifStore.fetchUnreadCount()

  // Listen for real-time notifications
  const token = localStorage.getItem('authToken')
  if (token) {
    await signalR.initializeNotificationHub(token)
    signalR.onReceiveNotification((notification: any) => {
      notifStore.addNotification({
        id: notification.id || notification.Id,
        title: notification.title || notification.Title || '',
        description: notification.description || notification.Description || '',
        type: notification.type || notification.Type || 'general',
        isRead: false,
        relatedEntityId: notification.relatedEntityId || notification.RelatedEntityId,
        createdAt: notification.createdAt || notification.CreatedAt || new Date().toISOString()
      })
    })
  }
})

onUnmounted(() => {
  signalR.offReceiveNotification()
})
</script>

<template>
  <div class="group z-20 inline-flex items-center justify-center text-right">
    <Menu v-slot="{ close }" as="div" class="relative z-20 size-9 text-left">
      <MenuButton as="div">
        <button
          type="button"
          class="group-hover:ring-muted-200 dark:group-hover:ring-muted-700 dark:ring-offset-muted-900 inline-flex size-9 items-center justify-start rounded-full ring-1 ring-transparent transition-all duration-300 group-hover:ring-offset-4"
          @click="notifStore.fetchNotifications(true)"
        >
          <div class="relative">
            <BaseAvatar size="sm">
              <Icon name="ph:bell" />
            </BaseAvatar>
            <span
              v-if="notifStore.unreadCount > 0"
              class="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-primary-500 rounded-full"
            >
              {{ notifStore.unreadCount > 99 ? '99+' : notifStore.unreadCount }}
            </span>
          </div>
        </button>
      </MenuButton>

      <Transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <MenuItems
          class="divide-muted-100 border-muted-200 dark:divide-muted-700 dark:border-muted-700 dark:bg-muted-800 absolute end-0 mt-2 origin-top-right divide-y rounded-md border bg-white shadow-lg focus:outline-none"
          style="width: 380px; max-height: 400px; overflow-y: auto; scrollbar-width: none;"
        >
          <!-- Header -->
          <div class="p-4 flex items-center justify-between">
            <h4 class="font-heading text-muted-500 dark:text-muted-200 text-xs uppercase">
              الإشعارات
            </h4>
            <div class="flex items-center gap-3">
              <button
                v-if="notifStore.unreadCount > 0"
                class="text-xs text-primary-500 hover:text-primary-600 font-medium"
                @click.stop="notifStore.markAllAsRead()"
              >
                قراءة الكل
              </button>
              <button
                class="text-xs font-bold text-muted-500 hover:text-primary-500 dark:text-muted-200"
                @click="() => { useRouter().push('/notifications'); close() }"
              >
                عرض الكل
              </button>
            </div>
          </div>

          <!-- Loading -->
          <template v-if="notifStore.loading && notifStore.notifications.length === 0">
            <div v-for="_ in 4" :key="_" class="p-3">
              <BasePlaceload class="h-10 w-full rounded" />
            </div>
          </template>

          <!-- Empty -->
          <div v-else-if="notifStore.notifications.length === 0" class="p-8 text-center">
            <Icon name="ph:bell-slash-duotone" class="w-10 h-10 mx-auto text-muted-300 mb-2" />
            <p class="text-muted-400 text-sm">لا توجد إشعارات</p>
          </div>

          <!-- Notifications List -->
          <template v-else>
            <MenuItem
              v-for="n in notifStore.notifications.slice(0, 8)"
              :key="n.id"
              as="div"
              class="w-full"
            >
              <div
                class="flex items-start gap-3 p-3 cursor-pointer transition-colors hover:bg-muted-50 dark:hover:bg-muted-700/50"
                :class="!n.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''"
                @click="() => { handleNotificationClick(n); close() }"
              >
                <div class="flex-shrink-0 mt-0.5">
                  <Icon :name="getTypeIcon(n.type)" class="w-5 h-5" :class="getTypeColor(n.type)" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-2">
                    <h6 class="text-xs font-semibold text-muted-800 dark:text-white truncate">
                      {{ n.title }}
                    </h6>
                    <span class="text-[10px] text-muted-400 whitespace-nowrap">
                      {{ formatTime(n.createdAt) }}
                    </span>
                  </div>
                  <p class="text-xs text-muted-400 mt-0.5 line-clamp-2">
                    {{ n.description }}
                  </p>
                </div>
                <div v-if="!n.isRead" class="flex-shrink-0 mt-1.5">
                  <span class="w-2 h-2 rounded-full bg-primary-500 block"></span>
                </div>
              </div>
            </MenuItem>
          </template>
        </MenuItems>
      </Transition>
    </Menu>
  </div>
</template>
