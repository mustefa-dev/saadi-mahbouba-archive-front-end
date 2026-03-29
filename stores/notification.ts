export interface AppNotification {
  id: string
  title: string
  description: string
  type: string // 'report' | 'message' | 'general'
  userId?: string
  isRead: boolean
  relatedEntityId?: string
  createdAt: string
  readAt?: string
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<AppNotification[]>([])
  const unreadCount = ref(0)
  const currentPage = ref(1)
  const hasMore = ref(true)
  const loading = ref(false)

  const fetchNotifications = async (reset = false) => {
    const apiPaths = useApiPaths()
    if (reset) {
      currentPage.value = 1
      hasMore.value = true
    }
    loading.value = true
    try {
      const response = await $fetch<any>(apiPaths.notifications, {
        query: { pageNumber: currentPage.value, pageSize: 20 }
      })
      const data = response?.data || response || []
      if (reset) {
        notifications.value = data
      } else {
        notifications.value = [...notifications.value, ...data]
      }
      hasMore.value = data.length >= 20
    } catch {
      // Silently handle
    } finally {
      loading.value = false
    }
  }

  const loadMore = async () => {
    if (!hasMore.value || loading.value) return
    currentPage.value++
    await fetchNotifications()
  }

  const fetchUnreadCount = async () => {
    const apiPaths = useApiPaths()
    try {
      const response = await $fetch<any>(apiPaths.notificationUnreadCount)
      unreadCount.value = typeof response === 'number' ? response : (response?.data ?? 0)
    } catch {
      // Silently handle
    }
  }

  const markAsRead = async (id: string) => {
    const apiPaths = useApiPaths()
    try {
      await $fetch(apiPaths.notificationRead(id), { method: 'POST' })
      const n = notifications.value.find(n => n.id === id)
      if (n) n.isRead = true
      if (unreadCount.value > 0) unreadCount.value--
    } catch {
      // Silently handle
    }
  }

  const markAllAsRead = async () => {
    const apiPaths = useApiPaths()
    try {
      await $fetch(apiPaths.notificationReadAll, { method: 'POST' })
      notifications.value.forEach(n => n.isRead = true)
      unreadCount.value = 0
    } catch {
      // Silently handle
    }
  }

  const addNotification = (notification: AppNotification) => {
    notifications.value.unshift(notification)
    if (!notification.isRead) unreadCount.value++
  }

  return {
    notifications,
    unreadCount,
    hasMore,
    loading,
    fetchNotifications,
    loadMore,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    addNotification
  }
})
