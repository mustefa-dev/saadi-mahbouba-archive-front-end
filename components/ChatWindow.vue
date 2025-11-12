<template>
  <div class="flex flex-col h-full bg-white dark:bg-[#0e1621]">
    <!-- Header - Telegram style -->
    <div class="flex-shrink-0 bg-white dark:bg-[#212121] border-b border-muted-200 dark:border-muted-800/30 px-4 py-3">
      <div class="flex items-center gap-3">
        <!-- Back button (mobile only) -->
        <button
          class="md:hidden p-2 -mr-2 hover:bg-muted-100 dark:hover:bg-muted-700/30 rounded-full transition-colors"
          @click="emit('close')"
        >
          <Icon name="ph:arrow-right" class="size-6 text-muted-700 dark:text-muted-300" />
        </button>

        <!-- Avatar -->
        <div class="flex-shrink-0">
          <div class="flex items-center justify-center size-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white font-semibold text-base">
            {{ userName.charAt(0).toUpperCase() }}
          </div>
        </div>

        <!-- User info -->
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-base text-muted-900 dark:text-white truncate">
            {{ userName }}
          </h3>
          <p v-if="userIsTyping" class="text-xs text-primary-500 dark:text-primary-400 animate-pulse">
            يكتب...
          </p>
          <p v-else class="text-xs text-muted-500 dark:text-muted-400">
            {{ isConnected ? 'متصل' : 'غير متصل' }}
          </p>
        </div>

        <!-- Action buttons -->
        <div class="flex items-center gap-1">
          <button
            class="p-2 hover:bg-muted-100 dark:hover:bg-muted-700/30 rounded-full transition-colors"
            @click="fetchMessages()"
            :disabled="isLoading"
          >
            <Icon name="ph:arrows-clockwise" class="size-5 text-muted-600 dark:text-muted-400" :class="{ 'animate-spin': isLoading }" />
          </button>
        </div>
      </div>
    </div>

    <!-- Messages Container - Telegram style -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto px-3 sm:px-6 md:px-12 lg:px-16 py-4 space-y-1 custom-scrollbar bg-[#f4f4f5] dark:bg-[#0e1621]"
      @scroll="handleScroll"
    >
      <!-- Loading State -->
      <div v-if="isLoading && pageNumber === 0" class="flex items-center justify-center py-8">
        <Icon name="svg-spinners:ring-resize" class="size-8 text-primary-500" />
      </div>

      <!-- Empty State -->
      <div v-else-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-muted-400">
        <Icon name="ph:chat-text-duotone" class="size-16 mb-4 opacity-50" />
        <p class="text-lg">لا توجد رسائل بعد</p>
        <p class="text-sm">ابدأ المحادثة</p>
      </div>

      <!-- Messages -->
      <template v-else>
        <div
          v-for="message in messages"
          :key="message.id"
          class="flex items-end gap-1"
          :class="message.isAdminMessage ? 'justify-start' : 'justify-end'"
        >
          <div
            class="max-w-[85%] sm:max-w-[70%] md:max-w-[65%] rounded-lg px-3 py-2 shadow-sm relative"
            :class="message.isAdminMessage
              ? 'bg-white dark:bg-[#2b2b2b] text-muted-900 dark:text-white rounded-bl-md'
              : 'bg-primary-500 dark:bg-primary-600 text-white rounded-br-md'"
          >
            <!-- Text Message -->
            <p v-if="message.type === MessageType.TEXT" class="text-sm leading-relaxed break-words">
              {{ message.content }}
            </p>

            <!-- Image Message -->
            <div v-else-if="message.type === MessageType.IMAGE && message.attachmentUrl">
              <p v-if="message.content" class="text-sm mb-2">{{ message.content }}</p>
              <img
                :src="getAssetUrl(message.attachmentUrl)"
                :alt="message.content || 'صورة'"
                class="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                style="max-height: 300px; object-fit: cover;"
                @click="openImageInNewTab(message.attachmentUrl!)"
                loading="lazy"
              />
            </div>

            <!-- File Message -->
            <div v-else-if="message.type === MessageType.FILE && message.attachmentUrl">
              <p v-if="message.content" class="text-sm mb-2">{{ message.content }}</p>
              <a
                :href="getAssetUrl(message.attachmentUrl)"
                target="_blank"
                download
                class="flex items-center gap-3 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Icon name="ph:file-duotone" class="size-6" />
                <span class="text-sm">ملف مرفق</span>
              </a>
            </div>

            <!-- Voice Message -->
            <div v-else-if="message.type === MessageType.VOICE && message.attachmentUrl" class="min-w-[200px]">
              <p v-if="message.content" class="text-sm mb-2">{{ message.content }}</p>
              <div class="flex items-center gap-2">
                <Icon name="ph:microphone-duotone" class="size-5" />
                <audio
                  :src="getAssetUrl(message.attachmentUrl)"
                  controls
                  class="w-full h-8"
                />
              </div>
            </div>

            <!-- Timestamp and Status -->
            <div class="flex items-center justify-end gap-1.5 mt-1 min-w-[60px]">
              <span class="text-[11px] whitespace-nowrap opacity-70">
                {{ formatTime(message.sentAt) }}
              </span>
              <Icon
                v-if="!message.isAdminMessage"
                :name="message.isRead ? 'ph:checks' : 'ph:check'"
                class="size-4 flex-shrink-0 opacity-70"
              />
            </div>
          </div>
        </div>

        <!-- Typing Indicator -->
        <div v-if="userIsTyping" class="flex items-end gap-1 justify-end">
          <div class="bg-white dark:bg-[#2b2b2b] text-muted-900 dark:text-white rounded-lg px-3 py-2 shadow-sm rounded-bl-md">
            <div class="flex gap-1">
              <div class="w-2 h-2 bg-muted-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
              <div class="w-2 h-2 bg-muted-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
              <div class="w-2 h-2 bg-muted-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Input Area - Telegram style -->
    <div class="flex-shrink-0 bg-white dark:bg-[#212121] border-t border-muted-200 dark:border-muted-800/30 px-4 py-3">
      <!-- File Preview -->
      <div v-if="selectedFiles.length > 0" class="mb-3 space-y-2">
        <div
          v-for="(filePreview, index) in selectedFiles"
          :key="index"
          class="flex items-center gap-3 p-3 bg-muted-100 dark:bg-muted-800 rounded-lg"
        >
          <!-- Image Preview -->
          <img
            v-if="filePreview.type === 'image' && filePreview.previewUrl"
            :alt="filePreview.file.name"
            :src="filePreview.previewUrl"
            class="size-12 rounded-lg object-cover"
          />
          <!-- File/Voice Icon -->
          <div v-else class="size-12 flex items-center justify-center bg-muted-200 dark:bg-muted-700 rounded-lg">
            <Icon
              :name="filePreview.type === 'voice' ? 'ph:microphone' : 'ph:file'"
              class="size-6 text-muted-500"
            />
          </div>

          <!-- File Info -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{{ filePreview.file.name }}</p>
            <p class="text-xs text-muted-400">{{ formatFileSize(filePreview.file.size) }}</p>
          </div>

          <!-- Remove Button -->
          <button
            @click="removeFile(index)"
            class="p-1 rounded-full hover:bg-muted-200 dark:hover:bg-muted-700 transition-colors"
          >
            <Icon name="ph:x" class="size-4 text-muted-500" />
          </button>
        </div>

        <!-- Send Files Button -->
        <button
          @click="sendFiles"
          :disabled="isUploading"
          class="w-full py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors disabled:opacity-50"
        >
          <Icon v-if="isUploading" name="svg-spinners:ring-resize" class="size-5 inline-block" />
          <span v-else>إرسال {{ selectedFiles.length }} ملف</span>
        </button>
      </div>

      <!-- Upload Progress -->
      <div v-if="isUploading" class="mb-3 p-3 bg-muted-100 dark:bg-muted-800 rounded-lg">
        <div class="flex items-center gap-3 mb-2">
          <Icon name="svg-spinners:ring-resize" class="size-5 text-primary-500" />
          <span class="text-sm">جاري رفع الملفات...</span>
          <span class="text-sm text-muted-400 mr-auto">{{ uploadProgress }}%</span>
        </div>
        <div class="w-full bg-muted-200 dark:bg-muted-700 rounded-full h-2">
          <div
            class="bg-primary-500 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${uploadProgress}%` }"
          />
        </div>
      </div>

      <!-- Input Form - Telegram style -->
      <form @submit.prevent="sendMessage()" class="flex items-center gap-2">
        <!-- Attachment buttons -->
        <div class="flex items-center gap-1">
          <!-- Image Upload -->
          <label class="cursor-pointer flex-shrink-0">
            <input
              ref="imageInput"
              type="file"
              multiple
              accept="image/*"
              class="hidden"
              @change="handleImageSelect"
            />
            <span class="inline-block p-2 rounded-full hover:bg-muted-100 dark:hover:bg-muted-700/30 transition-colors">
              <Icon name="ph:image" class="size-5 text-muted-500 dark:text-muted-400" />
            </span>
          </label>

          <!-- File Upload -->
          <label class="cursor-pointer flex-shrink-0">
            <input
              ref="fileInput"
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
              class="hidden"
              @change="handleFileSelect"
            />
            <span class="inline-block p-2 rounded-full hover:bg-muted-100 dark:hover:bg-muted-700/30 transition-colors">
              <Icon name="ph:paperclip" class="size-5 text-muted-500 dark:text-muted-400" />
            </span>
          </label>

          <!-- Voice Recording -->
          <button
            type="button"
            @click="isRecording ? stopRecording() : startRecording()"
            class="flex-shrink-0 p-2 rounded-full hover:bg-muted-100 dark:hover:bg-muted-700/30 transition-colors"
            :class="{ 'bg-red-100 dark:bg-red-900/20': isRecording }"
          >
            <Icon
              :name="isRecording ? 'ph:stop-circle' : 'ph:microphone'"
              class="size-5"
              :class="isRecording ? 'text-red-500' : 'text-muted-500 dark:text-muted-400'"
            />
          </button>
        </div>

        <!-- Input field -->
        <div class="flex-1 bg-muted-50 dark:bg-[#181818] rounded-lg">
          <input
            v-model="newMessage"
            type="text"
            placeholder="أكتب رسالة..."
            class="w-full px-4 py-2.5 bg-transparent outline-none text-[15px] text-muted-900 dark:text-white placeholder-muted-400 dark:placeholder-muted-500"
            :disabled="isSending || isUploading"
            @keydown.enter.exact.prevent="sendMessage()"
          />
        </div>

        <!-- Send button -->
        <button
          type="submit"
          :disabled="isSending || (!newMessage.trim() && selectedFiles.length === 0) || isUploading"
          class="flex-shrink-0 p-2.5 rounded-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Icon
            v-if="isSending"
            name="svg-spinners:ring-resize"
            class="size-5 text-white"
          />
          <Icon
            v-else
            name="ph:paper-plane-tilt"
            class="size-5 text-white"
          />
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import type { Message, FilePreview } from '~/types/messages'
import { MessageType } from '~/types/messages'

const props = defineProps<{
  userId: string;
  userName: string;
}>();

const emit = defineEmits<{
  close: []
}>();

const config = useRuntimeConfig()
const userStore = useAppUserStore()
const signalR = useSignalR()
const apiPaths = useApiPaths()
const helpers = useHelpers()

const token = await userStore.getToken()

// State
const messages = ref<Message[]>([])
const newMessage = ref('')
const pageNumber = ref(0)
const pageSize = ref(50)
const isLoading = ref(false)
const isSending = ref(false)
const hasMore = ref(true)
const messagesContainer = ref<HTMLElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const imageInput = ref<HTMLInputElement | null>(null)
const selectedFiles = ref<FilePreview[]>([])
const isUploading = ref(false)
const uploadProgress = ref(0)
const userIsTyping = ref(false)
const typingTimeout = ref<ReturnType<typeof setTimeout> | null>(null)
const isRecording = ref(false)
const mediaRecorder = ref<MediaRecorder | null>(null)
const audioChunks = ref<Blob[]>([])
const { isConnected } = signalR

// Fetch messages
const fetchMessages = async (append = false) => {
  if (isLoading.value || (!hasMore.value && append)) return

  isLoading.value = true
  try {
    const response = await $fetch<any>(apiPaths.conversationById(props.userId), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      },
      query: {
        pageNumber: pageNumber.value,
        pageSize: pageSize.value
      }
    })

    if (response.data && response.data.length > 0) {
      const reversedMessages = [...response.data].reverse()

      if (append) {
        messages.value = [...reversedMessages, ...messages.value]
      } else {
        messages.value = reversedMessages
        await nextTick()
        scrollToBottom()
      }

      if (response.data.length < pageSize.value) {
        hasMore.value = false
      }
    } else {
      hasMore.value = false
    }

    await markAsRead()
  } catch (error) {
    console.error('Error loading messages:', error)
    helpers.setErrorMessage(error, 'ar', 'Failed to load messages', 'فشل تحميل الرسائل')
  } finally {
    isLoading.value = false
  }
}

// Send message
const sendMessage = async () => {
  const messageContent = newMessage.value.trim()
  if (!messageContent) return
  if (isSending.value) return

  isSending.value = true
  const tempContent = messageContent
  newMessage.value = ''

  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
  }
  await signalR.sendTypingIndicator(props.userId, false)

  try {
    await $fetch<any>(apiPaths.sendMessage, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: {
        content: tempContent,
        type: MessageType.TEXT,
        attachmentUrl: null,
        toUserId: props.userId
      }
    })

    await nextTick()
    scrollToBottom()
    await markAsRead()
  } catch (error) {
    console.error('Error sending message:', error)
    newMessage.value = tempContent
    helpers.setErrorMessage(error, 'ar', 'Failed to send message', 'فشل إرسال الرسالة')
  } finally {
    isSending.value = false
  }
}

// File handling
const getFileType = (file: File): 'image' | 'file' | 'voice' => {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('audio/')) return 'voice'
  return 'file'
}

const getMessageType = (fileType: 'image' | 'file' | 'voice'): MessageType => {
  switch (fileType) {
    case 'image': return MessageType.IMAGE
    case 'voice': return MessageType.VOICE
    case 'file': return MessageType.FILE
    default: return MessageType.FILE
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const files = Array.from(target.files)
    files.forEach(file => {
      const fileType = getFileType(file)
      const preview: FilePreview = {
        file,
        type: fileType,
        previewUrl: fileType === 'image' ? URL.createObjectURL(file) : undefined
      }
      selectedFiles.value.push(preview)
    })
  }
}

const handleImageSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const files = Array.from(target.files)
    files.forEach(file => {
      const preview: FilePreview = {
        file,
        type: 'image',
        previewUrl: URL.createObjectURL(file)
      }
      selectedFiles.value.push(preview)
    })
  }
}

const removeFile = (index: number) => {
  const file = selectedFiles.value[index]
  if (file.previewUrl) {
    URL.revokeObjectURL(file.previewUrl)
  }
  selectedFiles.value.splice(index, 1)
}

const sendFiles = async () => {
  if (selectedFiles.value.length === 0) return

  isUploading.value = true
  uploadProgress.value = 0

  try {
    for (let i = 0; i < selectedFiles.value.length; i++) {
      const filePreview = selectedFiles.value[i]
      const file = filePreview.file
      const messageType = getMessageType(filePreview.type)
      const content = filePreview.type === 'image' ? 'صورة' : filePreview.type === 'voice' ? 'رسالة صوتية' : file.name

      const formData = new FormData()
      formData.append('Content', content)
      formData.append('Type', messageType.toString())
      formData.append('Attachment', file)
      formData.append('ToUserId', props.userId)

      await $fetch<any>(apiPaths.sendMessageWithAttachment, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      uploadProgress.value = Math.round(((i + 1) / selectedFiles.value.length) * 100)
    }

    await nextTick()
    scrollToBottom()

    selectedFiles.value.forEach(file => {
      if (file.previewUrl) {
        URL.revokeObjectURL(file.previewUrl)
      }
    })
    selectedFiles.value = []

    if (fileInput.value) fileInput.value.value = ''
    if (imageInput.value) imageInput.value.value = ''

    await markAsRead()
  } catch (error) {
    console.error('Error sending files:', error)
    helpers.setErrorMessage(error, 'ar', 'Failed to send files', 'فشل إرسال الملفات')
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
  }
}

// Voice recording
const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder.value = new MediaRecorder(stream)
    audioChunks.value = []

    mediaRecorder.value.ondataavailable = (event) => {
      audioChunks.value.push(event.data)
    }

    mediaRecorder.value.onstop = async () => {
      const audioBlob = new Blob(audioChunks.value, { type: 'audio/webm' })
      const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' })

      const preview: FilePreview = {
        file: audioFile,
        type: 'voice'
      }
      selectedFiles.value.push(preview)

      stream.getTracks().forEach(track => track.stop())
    }

    mediaRecorder.value.start()
    isRecording.value = true
  } catch (error) {
    console.error('Error starting recording:', error)
    helpers.setErrorMessage(error, 'ar', 'Failed to start recording', 'فشل بدء التسجيل')
  }
}

const stopRecording = () => {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop()
    isRecording.value = false
  }
}

// Mark messages as read
const markAsRead = async () => {
  try {
    const unreadIds = messages.value
      .filter(m => !m.isAdminMessage && !m.isRead)
      .map(m => m.id)

    if (unreadIds.length > 0) {
      await $fetch(apiPaths.markMessageRead, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: unreadIds
      })

      messages.value = messages.value.map(m => {
        if (unreadIds.includes(m.id)) {
          return { ...m, isRead: true }
        }
        return m
      })
    }
  } catch (error) {
    console.error('Error marking messages as read:', error)
  }
}

// Scroll to bottom
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// Handle scroll for pagination
const handleScroll = useDebounceFn(() => {
  if (messagesContainer.value && messagesContainer.value.scrollTop === 0 && hasMore.value) {
    const previousHeight = messagesContainer.value.scrollHeight
    pageNumber.value++
    fetchMessages(true).then(() => {
      nextTick(() => {
        if (messagesContainer.value) {
          const newHeight = messagesContainer.value.scrollHeight
          messagesContainer.value.scrollTop = newHeight - previousHeight
        }
      })
    })
  }
}, 300)

// Handle typing indicator
const handleTyping = useDebounceFn(async () => {
  if (newMessage.value.trim()) {
    await signalR.sendTypingIndicator(props.userId, true)

    if (typingTimeout.value) {
      clearTimeout(typingTimeout.value)
    }

    typingTimeout.value = setTimeout(async () => {
      await signalR.sendTypingIndicator(props.userId, false)
    }, 3000)
  }
}, 500)

// Format time
const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('ar-IQ', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 بايت'
  const k = 1024
  const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// Get asset URL
const getAssetUrl = (path: string): string => {
  return apiPaths.getAsset(path)
}

// Watch for input changes
// Open image in new tab
const openImageInNewTab = (attachmentUrl: string) => {
  const url = getAssetUrl(attachmentUrl)
  window.open(url, '_blank')
}

watch(newMessage, () => {
  if (newMessage.value.trim()) {
    handleTyping()
  }
})

// Initialize SignalR and fetch messages
onMounted(async () => {
  if (token && !signalR.isConnected.value) {
    try {
      await signalR.initializeConnection(token)

      signalR.onReceiveMessage((message: Message) => {
        if (message.fromUserId === props.userId || message.toUserId === props.userId) {
          const exists = messages.value.some(m => m.id === message.id)
          if (!exists) {
            messages.value.push(message)
            nextTick(() => scrollToBottom())

            if (message.fromUserId === props.userId && !message.isAdminMessage) {
              markAsRead()
              signalR.sendMessageReadReceipt(message.id)
            }
          }
        }
      })

      signalR.onUserTyping((data) => {
        if (data.userId === props.userId) {
          userIsTyping.value = data.isTyping
        }
      })

      signalR.onMessageRead((data) => {
        messages.value = messages.value.map(m => {
          if (m.id === data.messageId) {
            return { ...m, isRead: true }
          }
          return m
        })
      })
    } catch (error) {
      console.error('SignalR connection failed:', error)
    }
  }

  await fetchMessages()
  await markAsRead()
})

// Cleanup
onUnmounted(() => {
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
  }

  selectedFiles.value.forEach(file => {
    if (file.previewUrl) {
      URL.revokeObjectURL(file.previewUrl)
    }
  })
})
</script>

<style scoped>
/* Custom scrollbar */
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
