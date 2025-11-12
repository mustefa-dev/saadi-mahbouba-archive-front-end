<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import { timeAgo } from '~/utils/helpers';

useHead({
  title: "المحادثات"
})

definePageMeta({
  title: "المحادثات"
})

export interface Conversation {
  userId: string
  userName: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

const userStore = useAppUserStore()
const signalR = useSignalR()
const { isOpen } = useCollapse()
const route = useRoute()
const config = useRuntimeConfig()

const token = await userStore.getToken()

// State
const conversations = ref<Conversation[]>([])
const isLoading = ref(false)
const pageNumber = ref(0)
const pageSize = ref(20)
const searchQuery = ref('')
const totalUnreadCount = ref(0)
const selectedUserId = ref<string | null>(null)
const selectedUserName = ref<string>('')

const formatTimeAgo = timeAgo

// Toggle conversations sidebar
const toggleConversationsSidebar = () => {
  isConversationsSidebarCollapsed.value = !isConversationsSidebarCollapsed.value
}

// Fetch conversations using mobile app pattern
const fetchConversations = async () => {
  isLoading.value = true
  try {
    const response = await $fetch<any>(`${config.public.baseUrl}/message/conversations`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      },
      query: {
        pageNumber: pageNumber.value,
        pageSize: pageSize.value
      }
    })

    conversations.value = response.data || []

    // Calculate total unread count
    totalUnreadCount.value = conversations.value.reduce(
      (sum, conv) => sum + (conv.unreadCount || 0),
      0
    )
  } catch (error) {
    console.error('❌ Failed to load conversations:', error)
    useHelpers().setErrorMessage(error, 'ar', 'Failed to load conversations', 'فشل تحميل المحادثات')
  } finally {
    isLoading.value = false
  }
}

// Open conversation
const openConversation = (userId: string, userName: string) => {
  console.log('🎯 Opening conversation:', { userId, userName })
  selectedUserId.value = userId
  selectedUserName.value = userName
}

// Filtered and sorted conversations
const filteredConversations = computed(() => {
  let result = conversations.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      conv =>
        conv.userName.toLowerCase().includes(query) ||
        (conv.lastMessage && conv.lastMessage.toLowerCase().includes(query))
    )
  }

  return [...result].sort((a, b) => {
    const dateA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0
    const dateB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0
    return dateB - dateA
  })
})

// Handle search
const handleSearch = useDebounceFn(() => {
  // Search is handled by computed property
}, 300)

// Get user initials for avatar
const getUserInitials = (name: string): string => {
  return name.charAt(0).toUpperCase()
}

// Format unread count (show 9+ for 10 or more)
const formatUnreadCount = (count: number): string => {
  return count > 9 ? '9+' : count.toString()
}

let refreshInterval: ReturnType<typeof setInterval> | null = null

// Watch for route changes
watch(() => route.path, (newPath, oldPath) => {
  if (oldPath === '/chats' && newPath !== '/chats') {
    isOpen.value = true
  } else if (newPath === '/chats' && oldPath !== '/chats') {
    isOpen.value = false
  }
})

// Initialize - Mobile app pattern
onMounted(async () => {
  console.log('🚀 Chat page mounted')
  
  // Collapse navigation sidebar
  isOpen.value = false

  // Initialize SignalR
  if (token) {
    try {
      await signalR.initializeConnection(token)

      // Listen for new messages - mobile app pattern
      signalR.onReceiveMessage((message: any) => {
        console.log('📨 New message received:', message)

        // Update conversation list
        const convIndex = conversations.value.findIndex(
          c => c.userId === message.fromUserId || c.userId === message.FromUserId
        )

        if (convIndex !== -1) {
          const conv = conversations.value[convIndex]
          conversations.value.splice(convIndex, 1)
          conversations.value.unshift({
            ...conv,
            lastMessage: message.content || message.Content,
            lastMessageTime: message.sentAt || message.SentAt,
            unreadCount: (conv.unreadCount || 0) + 1
          })
        } else {
          // New conversation
          conversations.value.unshift({
            userId: message.fromUserId || message.FromUserId,
            userName: message.fromUserName || message.FromUserName || 'مستخدم',
            lastMessage: message.content || message.Content,
            lastMessageTime: message.sentAt || message.SentAt,
            unreadCount: 1
          })
        }

        totalUnreadCount.value++
      })

      console.log('✅ SignalR listeners attached')
    } catch (error) {
      console.error('❌ SignalR connection failed:', error)
    }
  }

  // Fetch conversations
  await fetchConversations()

  // Poll for updates every 30 seconds
  refreshInterval = setInterval(() => {
    fetchConversations()
  }, 30000)
})

// Cleanup
onUnmounted(() => {
  console.log('👋 Chat page unmounted')

  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }

  signalR.offReceiveMessage()
  
  // Restore navigation sidebar
  isOpen.value = true
})
</script>

<template>
  <!-- Telegram Web Style Layout -->
  <div class="h-[calc(100vh-70px)] flex flex-row-reverse overflow-hidden bg-white dark:bg-[#0e1621]">
    <!-- Chat Area (Left side) - Main conversation view -->
    <div
      class="flex-1 flex flex-col bg-[#f4f4f5] dark:bg-[#0e1621] relative"
      :class="{ 'hidden md:flex': selectedUserId }"
    >
      <!-- Empty State - When no chat selected -->
      <div v-if="!selectedUserId" class="flex-1 flex flex-col items-center justify-center border-l border-muted-200 dark:border-muted-800">
        <div class="text-center px-8 max-w-md">
          <div class="mb-8">
            <div class="inline-flex items-center justify-center w-72 h-72 rounded-full bg-muted-100 dark:bg-muted-900/30 mb-6 relative">
              <Icon name="ph:chats-duotone" class="size-32 text-muted-300 dark:text-muted-700" />
              <div class="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                <Icon name="ph:chat-circle-dots-duotone" class="size-12 text-primary-500" />
              </div>
            </div>
          </div>
          <h2 class="text-3xl font-bold text-muted-800 dark:text-muted-200 mb-3">
            محادثاتك في انتظارك
          </h2>
          <p class="text-lg text-muted-500 dark:text-muted-400 mb-2">
            اختر محادثة من القائمة للبدء
          </p>
          <p class="text-sm text-muted-400 dark:text-muted-500">
            أو ابحث عن مستخدم للتواصل معه
          </p>
        </div>
      </div>

      <!-- Chat Window Component - key forces re-render when user changes -->
      <ChatWindow
        v-if="selectedUserId"
        :key="selectedUserId"
        :user-id="selectedUserId"
        :user-name="selectedUserName"
        @close="selectedUserId = null"
      />
    </div>

    <!-- Conversations Sidebar (Right side) - Telegram style -->
    <div
      class="flex-shrink-0 flex flex-col bg-white dark:bg-[#212121] border-l border-muted-200/50 dark:border-muted-800/30 transition-all duration-300"
      :class="[
        { 'hidden md:flex': selectedUserId },
        isConversationsSidebarCollapsed
          ? 'w-0 md:w-16 overflow-hidden'
          : 'w-full md:w-[380px] lg:w-[420px] xl:w-[460px]'
      ]"
    >
      <!-- Collapsed state - show icon only -->
      <div v-if="isConversationsSidebarCollapsed" class="flex flex-col items-center py-4 gap-4 min-w-[64px]">
        <button
          @click="toggleConversationsSidebar"
          class="p-3 rounded-full hover:bg-muted-200/50 dark:hover:bg-muted-700/30 transition-colors"
          title="توسيع قائمة المحادثات"
        >
          <Icon name="ph:chats-duotone" class="size-6 text-muted-600 dark:text-muted-400" />
        </button>
        <div v-if="totalUnreadCount > 0" class="relative">
          <span class="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full bg-primary-500 text-white text-xs font-bold shadow-sm">
            {{ totalUnreadCount > 9 ? '9+' : totalUnreadCount }}
          </span>
        </div>
      </div>

      <!-- Expanded state - full sidebar -->
      <div v-else class="flex flex-col h-full w-full">
        <!-- Sidebar Header - Telegram style -->
        <div class="flex-shrink-0 bg-primary-600 dark:bg-[#2b2b2b] border-b border-primary-700/20 dark:border-muted-800/30">
          <div class="px-4 py-4">
            <div class="flex items-center justify-between mb-4">
              <!-- Hamburger menu icon (Telegram style) -->
              <button class="p-2 -mr-2 rounded-full hover:bg-white/10 transition-colors">
                <Icon name="ph:list" class="size-6 text-white" />
              </button>

              <div class="flex items-center gap-2">
                <!-- Unread count badge -->
                <div v-if="totalUnreadCount > 0" class="relative">
                  <span class="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-white text-primary-600 text-xs font-bold">
                    {{ totalUnreadCount > 99 ? '99+' : totalUnreadCount }}
                  </span>
                </div>
                <!-- Action buttons -->
                <button class="p-2 rounded-full hover:bg-white/10 transition-colors">
                  <Icon name="ph:magnifying-glass" class="size-5 text-white" />
                </button>
                <button
                  @click="toggleConversationsSidebar"
                  class="p-2 rounded-full hover:bg-white/10 transition-colors"
                  title="تصغير قائمة المحادثات"
                >
                  <Icon name="ph:sidebar-simple" class="size-5 text-white" />
                </button>
              </div>
            </div>

            <!-- Search Bar - Telegram style -->
            <div class="relative">
              <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <Icon name="ph:magnifying-glass" class="size-5 text-muted-400" />
              </div>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="بحث"
                class="w-full pr-11 pl-4 py-2 bg-white/90 dark:bg-[#181818] rounded-md outline-none text-muted-900 dark:text-white placeholder-muted-400 dark:placeholder-muted-500 transition-all"
              />
              <div v-if="searchQuery" class="absolute left-3 top-1/2 -translate-y-1/2">
                <button
                  @click="searchQuery = ''"
                  class="p-1 rounded-full hover:bg-muted-200 dark:hover:bg-muted-700 transition-colors"
                >
                  <Icon name="ph:x" class="size-4 text-muted-500" />
                </button>
              </div>
            </div>
          </div>
        </div>

      <!-- Conversations List - Telegram style -->
      <div class="flex-1 overflow-y-auto overscroll-contain custom-scrollbar bg-white dark:bg-[#212121]">
        <!-- Loading State -->
        <div v-if="isLoading" class="p-3 space-y-1">
          <p class="text-center text-sm text-muted-500">Loading conversations...</p>
          <div v-for="i in 10" :key="i" class="flex items-center gap-3 p-3 rounded-lg animate-pulse">
            <BasePlaceload class="size-14 rounded-full flex-shrink-0" />
            <div class="flex-1 space-y-2.5">
              <BasePlaceload class="h-4 w-3/4 rounded" />
              <BasePlaceload class="h-3 w-full rounded" />
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredConversations.length === 0" class="flex flex-col items-center justify-center py-16 px-8">
          <div class="w-32 h-32 rounded-full bg-muted-100 dark:bg-muted-800/30 flex items-center justify-center mb-6">
            <Icon name="ph:chat-circle-text-duotone" class="size-16 text-muted-300 dark:text-muted-600" />
          </div>
          <h3 class="text-lg font-semibold text-muted-700 dark:text-muted-300 mb-2">
            {{ searchQuery ? 'لا توجد نتائج' : 'لا توجد محادثات بعد' }}
          </h3>
          <p class="text-sm text-muted-500 dark:text-muted-400 text-center">
            {{ searchQuery ? 'جرب البحث بكلمات مختلفة' : 'ابدأ محادثة جديدة الآن' }}
          </p>
        </div>

        <!-- Conversations List -->
        <div v-else>
          <div
            v-for="conversation in filteredConversations"
            :key="conversation.userId"
            class="flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-150 border-b border-muted-100 dark:border-muted-800/30"
            :class="selectedUserId === conversation.userId
              ? 'bg-primary-50 dark:bg-primary-900/10'
              : 'hover:bg-muted-50 dark:hover:bg-[#2d2d2d]'"
            @click="openConversation(conversation.userId, conversation.userName)"
          >
            <!-- Avatar with online indicator -->
            <div class="flex-shrink-0 relative">
              <div
                class="flex items-center justify-center size-12 rounded-full font-semibold text-base"
                :class="conversation.unreadCount > 0
                  ? 'bg-gradient-to-br from-primary-400 to-primary-600 text-white'
                  : 'bg-gradient-to-br from-muted-200 to-muted-300 dark:from-muted-700 dark:to-muted-800 text-muted-700 dark:text-muted-300'"
              >
                {{ getUserInitials(conversation.userName) }}
              </div>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0 py-0.5">
              <div class="flex items-baseline justify-between mb-1">
                <h4
                  class="text-base font-semibold truncate"
                  :class="conversation.unreadCount > 0
                    ? 'text-muted-900 dark:text-white'
                    : 'text-muted-700 dark:text-muted-300'"
                >
                  {{ conversation.userName }}
                </h4>
                <span
                  class="text-xs flex-shrink-0 mr-2"
                  :class="conversation.unreadCount > 0
                    ? 'text-primary-600 dark:text-primary-400 font-medium'
                    : 'text-muted-400 dark:text-muted-500'"
                >
                  {{ formatTimeAgo(conversation.lastMessageTime) }}
                </span>
              </div>

              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-1.5 flex-1 min-w-0">
                  <!-- Message preview with icon for media -->
                  <Icon
                    v-if="conversation.lastMessage && conversation.lastMessage.includes('🖼️')"
                    name="ph:image-duotone"
                    class="size-4 flex-shrink-0"
                    :class="conversation.unreadCount > 0
                      ? 'text-muted-600 dark:text-muted-400'
                      : 'text-muted-500 dark:text-muted-500'"
                  />
                  <p
                    class="text-sm truncate flex-1"
                    :class="conversation.unreadCount > 0
                      ? 'text-muted-700 dark:text-muted-300 font-medium'
                      : 'text-muted-500 dark:text-muted-400'"
                  >
                    {{ conversation.lastMessage || 'لا توجد رسائل' }}
                  </p>
                </div>

                <!-- Unread Badge - Telegram style with blue -->
                <div v-if="conversation.unreadCount > 0" class="flex-shrink-0">
                  <span class="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary-500 text-white text-xs font-medium">
                    {{ formatUnreadCount(conversation.unreadCount) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar for conversations list */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
