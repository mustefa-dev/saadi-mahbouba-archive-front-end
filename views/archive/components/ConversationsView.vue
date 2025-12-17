<script setup lang="ts">
import type { ConversationMessage } from '~/types/archive'

const props = defineProps<{
  messages: any[]
  loading: boolean
}>()

const apiPaths = useApiPaths()

const formatDateTime = (dateString: string) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    const timeStr = date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    const dateStr = date.toLocaleDateString('en-CA') // YYYY-MM-DD format
    return `${timeStr} ${dateStr}`
  } catch {
    return dateString
  }
}

// Normalize message to always have camelCase properties
const normalizeMessage = (msg: any): ConversationMessage => ({
  id: msg.id || msg.Id || '',
  fromUserId: msg.fromUserId || msg.FromUserId || '',
  fromUserName: msg.fromUserName || msg.FromUserName || '',
  toUserId: msg.toUserId || msg.ToUserId,
  content: msg.content || msg.Content || '',
  type: msg.type ?? msg.Type ?? 0,
  attachmentUrl: msg.attachmentUrl || msg.AttachmentUrl,
  isAdminMessage: msg.isAdminMessage ?? msg.IsAdminMessage ?? false,
  sentAt: msg.sentAt || msg.SentAt || ''
})

const normalizedMessages = computed(() => props.messages.map(normalizeMessage))

const getAttachmentUrl = (url: string | undefined) => {
  if (!url) return ''
  return apiPaths.getAsset(url)
}
</script>

<template>
  <div class="w-full">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6 pb-4 border-b border-muted-200 dark:border-muted-700">
      <Icon name="ph:chat-circle-text-duotone" class="w-6 h-6 text-primary-500" />
      <h2 class="text-lg font-semibold text-muted-800 dark:text-muted-100">سجل المحادثات</h2>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 4" :key="i" class="p-4 bg-muted-100 dark:bg-muted-800 rounded-xl animate-pulse">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 bg-muted-200 dark:bg-muted-700 rounded-full"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-muted-200 dark:bg-muted-700 rounded w-1/4"></div>
            <div class="h-3 bg-muted-200 dark:bg-muted-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!normalizedMessages.length" class="flex flex-col items-center justify-center py-16 text-muted-400">
      <Icon name="ph:chat-circle-dashed-duotone" class="w-16 h-16 mb-4" />
      <p class="text-lg">لا توجد محادثات</p>
    </div>

    <!-- Messages List -->
    <div v-else class="space-y-4">
      <div
        v-for="message in normalizedMessages"
        :key="message.id"
        class="p-4 bg-white dark:bg-muted-800 border border-muted-200 dark:border-muted-700 rounded-xl"
      >
        <!-- Timestamp -->
        <div class="text-xs text-muted-400 mb-3">
          {{ formatDateTime(message.sentAt) }}
        </div>

        <!-- Message Content -->
        <div class="flex items-start gap-3">
          <!-- Avatar -->
          <div
            :class="[
              'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
              message.isAdminMessage
                ? 'bg-primary-100 dark:bg-primary-900/30'
                : 'bg-amber-100 dark:bg-amber-900/30'
            ]"
          >
            <Icon
              :name="message.isAdminMessage ? 'ph:user-gear-duotone' : 'ph:user-duotone'"
              :class="[
                'w-5 h-5',
                message.isAdminMessage ? 'text-primary-500' : 'text-amber-500'
              ]"
            />
          </div>

          <!-- Content -->
          <div class="flex-1">
            <!-- Sender Info -->
            <div class="flex items-center gap-2 mb-2">
              <span class="font-medium text-muted-800 dark:text-muted-100">
                {{ message.fromUserName }}
              </span>
              <span
                :class="[
                  'px-2 py-0.5 rounded text-xs font-medium',
                  message.isAdminMessage
                    ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                ]"
              >
                {{ message.isAdminMessage ? 'إدارة' : 'عميل' }}
              </span>
            </div>

            <!-- Message Text -->
            <p class="text-muted-600 dark:text-muted-300 leading-relaxed">
              {{ message.content }}
            </p>

            <!-- Attachment if any -->
            <div v-if="message.attachmentUrl" class="mt-3">
              <a
                :href="getAttachmentUrl(message.attachmentUrl)"
                target="_blank"
                class="inline-flex items-center gap-2 px-3 py-2 bg-muted-100 dark:bg-muted-700 rounded-lg text-sm text-muted-600 dark:text-muted-300 hover:bg-muted-200 dark:hover:bg-muted-600 transition-colors"
              >
                <Icon name="ph:paperclip" class="w-4 h-4" />
                <span>مرفق</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
