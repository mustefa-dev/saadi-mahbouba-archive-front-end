<script setup lang="ts">
import axios from '~/services/app-client/axios';
import type { Message, MessagesResponse } from '~/types/messages';
import { MessageType } from '~/types/messages';
import { formatDateAndTime } from '~/utils/helpers';

const props = defineProps<{
  userId: string;
  userName: string;
}>();

const emit = defineEmits<{
  close: []
}>();

const userStore = useAppUserStore();
const helpers = useHelpers();
const signalR = useSignalR();

const messages = ref<Message[]>([]);
const isLoading = ref(false);
const isSending = ref(false);
const messageText = ref('');
const selectedFile = ref<File | null>(null);
const filePreviewUrl = ref<string | null>(null);
const isTyping = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);

const pageNumber = ref(1);
const pageSize = ref(50);
const hasMoreMessages = ref(true);

// Watch for userId changes to reload messages
watch(() => props.userId, async (newUserId, oldUserId) => {
  console.log('👀 ChatWindow userId watcher fired:', { newUserId, oldUserId, equal: newUserId === oldUserId });
  if (newUserId && newUserId !== oldUserId) {
    console.log('🔄 User changed, reloading messages:', { from: oldUserId, to: newUserId });
    pageNumber.value = 1;
    messages.value = [];
    await fetchMessages();
  }
}, { immediate: false });

// Fetch messages
const fetchMessages = async (loadMore = false) => {
  isLoading.value = true;
  try {
    const apiPaths = useApiPaths();
    const response = await axios.get<MessagesResponse>(
      apiPaths.conversationById(props.userId),
      {
        params: {
          pageNumber: pageNumber.value,
          pageSize: pageSize.value
        }
      }
    );

    console.log('📥 Messages received:', response.data.data);
    console.log('📊 Message types:', response.data.data.map(m => ({ type: m.type, hasAttachment: !!m.attachmentUrl, url: m.attachmentUrl })));

    if (loadMore) {
      messages.value = [...response.data.data.reverse(), ...messages.value];
    } else {
      messages.value = response.data.data.reverse();
      scrollToBottom();
    }

    hasMoreMessages.value = response.data.pageCount > pageNumber.value;

    // Mark messages as read
    await markMessagesAsRead();
  } catch (error: any) {
    helpers.setErrorMessage(error, 'ar', 'Failed to load messages', 'فشل تحميل الرسائل');
  } finally {
    isLoading.value = false;
  }
};

// Send text message
const sendMessage = async () => {
  if (!messageText.value.trim() && !selectedFile.value) return;

  isSending.value = true;
  try {
    const apiPaths = useApiPaths();

    if (selectedFile.value) {
      // Send with attachment
      const formData = new FormData();
      formData.append('Attachment', selectedFile.value);
      formData.append('Content', messageText.value || '');
      formData.append('ToUserId', props.userId);

      // Determine message type
      let messageType = MessageType.FILE;
      if (selectedFile.value.type.startsWith('image/')) {
        messageType = MessageType.IMAGE;
      } else if (selectedFile.value.type.startsWith('audio/')) {
        messageType = MessageType.VOICE;
      }
      formData.append('Type', messageType.toString());

      await axios.post(apiPaths.sendMessageWithAttachment, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } else {
      // Send text only
      await axios.post(apiPaths.sendMessage, {
        content: messageText.value,
        type: MessageType.TEXT,
        toUserId: props.userId,
        attachmentUrl: null
      });
    }

    // Clear inputs
    messageText.value = '';
    selectedFile.value = null;
    filePreviewUrl.value = null;

    // Refresh messages
    await fetchMessages();
  } catch (error: any) {
    helpers.setErrorMessage(error, 'ar', 'Failed to send message', 'فشل إرسال الرسالة');
  } finally {
    isSending.value = false;
  }
};

// Handle file selection
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    selectedFile.value = file;

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        filePreviewUrl.value = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      filePreviewUrl.value = null;
    }
  }
};

// Remove selected file
const removeFile = () => {
  selectedFile.value = null;
  filePreviewUrl.value = null;
};

// Mark messages as read
const markMessagesAsRead = async () => {
  try {
    const unreadMessages = messages.value.filter(
      m => !m.isRead && !m.isAdminMessage
    );

    for (const message of unreadMessages) {
      const apiPaths = useApiPaths();
      await axios.post(apiPaths.markMessageRead, { messageId: message.id });
      message.isRead = true;
    }
  } catch (error) {
    console.error('Failed to mark messages as read:', error);
  }
};

// Scroll to bottom
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

// Load more messages (infinite scroll)
const handleScroll = () => {
  if (messagesContainer.value && messagesContainer.value.scrollTop === 0 && hasMoreMessages.value && !isLoading.value) {
    pageNumber.value++;
    fetchMessages(true);
  }
};

// Initialize SignalR
const initSignalR = async () => {
  try {
    const token = await userStore.getToken();
    if (token) {
      await signalR.initializeConnection(token);

      // Listen for new messages
      signalR.onReceiveMessage((message: Message) => {
        if (message.fromUserId === props.userId || message.toUserId === props.userId) {
          messages.value.push(message);
          scrollToBottom();

          // Mark as read if from user
          if (!message.isAdminMessage) {
            signalR.sendMessageReadReceipt(message.id);
          }
        }
      });

      // Listen for typing indicator
      signalR.onUserTyping((typingUserId: string, typing: boolean) => {
        if (typingUserId === props.userId) {
          isTyping.value = typing;
        }
      });

      // Listen for read receipts
      signalR.onMessageRead((messageId: string) => {
        const message = messages.value.find(m => m.id === messageId);
        if (message) {
          message.isRead = true;
        }
      });
    }
  } catch (error) {
    console.error('SignalR initialization failed:', error);
  }
};

// Get message type icon
const getFileIcon = (type: MessageType): string => {
  switch (type) {
    case MessageType.IMAGE:
      return 'ph:image-duotone';
    case MessageType.VOICE:
      return 'ph:microphone-duotone';
    case MessageType.FILE:
      return 'ph:file-duotone';
    default:
      return 'ph:file-duotone';
  }
};

// Get asset URL
const getAssetUrl = (path: string): string => {
  const apiPaths = useApiPaths();
  const url = apiPaths.getAsset(path);
  console.log('🔗 Asset URL generated:', { input: path, output: url });
  return url;
};

onMounted(async () => {
  console.log('🚀 ChatWindow mounted for user:', props.userId, props.userName);
  await fetchMessages();
  await initSignalR();
});

onUnmounted(() => {
  signalR.offReceiveMessage();
  signalR.offUserTyping();
  signalR.offMessageRead();
});
</script>

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
          <p v-if="isTyping" class="text-xs text-primary-500 font-medium animate-pulse">
            يكتب...
          </p>
          <p v-else class="text-xs text-muted-500 dark:text-muted-400">
            آخر ظهور مؤخرًا
          </p>
        </div>

        <!-- Action buttons -->
        <div class="flex items-center gap-1">
          <button class="p-2 hover:bg-muted-100 dark:hover:bg-muted-700/30 rounded-full transition-colors">
            <Icon name="ph:magnifying-glass" class="size-5 text-muted-600 dark:text-muted-400" />
          </button>
          <button class="p-2 hover:bg-muted-100 dark:hover:bg-muted-700/30 rounded-full transition-colors">
            <Icon name="ph:phone" class="size-5 text-muted-600 dark:text-muted-400" />
          </button>
          <button class="p-2 hover:bg-muted-100 dark:hover:bg-muted-700/30 rounded-full transition-colors">
            <Icon name="ph:dots-three-vertical" class="size-5 text-muted-600 dark:text-muted-400" />
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
      <div v-if="isLoading && pageNumber === 1" class="text-center py-8">
        <BaseLoader size="lg" />
      </div>

      <div v-if="hasMoreMessages && pageNumber > 1" class="text-center py-2">
        <BaseButton
          size="sm"
          color="default"
          variant="solid"
          :loading="isLoading"
          @click="() => { pageNumber++; fetchMessages(true); }"
        >
          تحميل المزيد
        </BaseButton>
      </div>

      <!-- Messages -->
      <div
        v-for="message in messages"
        :key="message.id"
        class="flex items-end gap-1"
        :class="message.isAdminMessage ? 'justify-end' : 'justify-start'"
      >
        <div
          class="max-w-[85%] sm:max-w-[70%] md:max-w-[65%] rounded-lg px-3 py-2 shadow-sm relative"
          :class="message.isAdminMessage
            ? 'bg-primary-500 dark:bg-primary-600 text-white rounded-br-md'
            : 'bg-white dark:bg-[#2b2b2b] text-muted-900 dark:text-white rounded-bl-md'"
        >
          <!-- Text Content -->
          <p v-if="message.content && message.type === MessageType.TEXT" class="text-sm leading-relaxed break-words">
            {{ message.content }}
          </p>

          <!-- Image -->
          <div v-if="message.type === MessageType.IMAGE && message.attachmentUrl">
            <p v-if="message.content" class="text-sm mb-2">{{ message.content }}</p>
            <img
              :src="getAssetUrl(message.attachmentUrl)"
              class="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              style="max-height: 300px; object-fit: cover;"
              @click="() => window.open(getAssetUrl(message.attachmentUrl!), '_blank')"
              @error="(e) => { console.error('Image failed to load:', getAssetUrl(message.attachmentUrl), e); }"
              loading="lazy"
            />
          </div>

          <!-- File -->
          <div v-if="message.type === MessageType.FILE && message.attachmentUrl">
            <p v-if="message.content" class="text-sm mb-2">{{ message.content }}</p>
            <a
              :href="getAssetUrl(message.attachmentUrl)"
              target="_blank"
              download
              class="flex items-center gap-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <div class="flex-shrink-0 p-2 rounded-lg bg-white/20">
                <Icon :name="getFileIcon(message.type)" class="size-6" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate">ملف مرفق</p>
                <p class="text-xs opacity-75">انقر للتحميل</p>
              </div>
            </a>
          </div>

          <!-- Voice Message -->
          <div v-if="message.type === MessageType.VOICE && message.attachmentUrl" class="min-w-[200px]">
            <p v-if="message.content" class="text-sm mb-2">{{ message.content }}</p>
            <div class="flex items-center gap-2">
              <Icon name="ph:microphone-duotone" class="size-5 flex-shrink-0" />
              <audio
                :src="getAssetUrl(message.attachmentUrl)"
                controls
                controlsList="nodownload"
                class="w-full h-8"
                style="filter: brightness(0.9);"
              >
                متصفحك لا يدعم تشغيل الملفات الصوتية
              </audio>
            </div>
          </div>

          <!-- Timestamp and Status - Telegram style -->
          <div class="flex items-center justify-end gap-1.5 mt-1 min-w-[60px]">
            <span class="text-[11px] whitespace-nowrap opacity-70">
              {{ formatDateAndTime(message.sentAt) }}
            </span>
            <Icon
              v-if="message.isAdminMessage"
              :name="message.isRead ? 'ph:checks' : 'ph:check'"
              class="size-4 flex-shrink-0 opacity-70"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Input Area - Telegram style -->
    <div class="flex-shrink-0 bg-white dark:bg-[#212121] border-t border-muted-200 dark:border-muted-800/30 px-4 py-3">
      <!-- File Preview -->
      <div v-if="selectedFile" class="mb-3 p-3 bg-muted-100 dark:bg-muted-800 rounded-xl flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="relative">
            <img
              v-if="filePreviewUrl"
              :src="filePreviewUrl"
              class="size-14 rounded-lg object-cover"
            />
            <div v-else class="size-14 rounded-lg bg-muted-200 dark:bg-muted-700 flex items-center justify-center">
              <Icon :name="getFileIcon(MessageType.FILE)" class="size-7 text-muted-400" />
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{{ selectedFile.name }}</p>
            <p class="text-xs text-muted-400">{{ (selectedFile.size / 1024).toFixed(1) }} KB</p>
          </div>
        </div>
        <BaseButtonIcon
          size="sm"
          color="danger"
          @click="removeFile"
        >
          <Icon name="ph:x" class="size-4" />
        </BaseButtonIcon>
      </div>

      <!-- Input Form - Telegram style -->
      <form @submit.prevent="sendMessage" class="flex items-center gap-2">
        <!-- Attachment button -->
        <label class="cursor-pointer flex-shrink-0">
          <input
            type="file"
            class="hidden"
            accept="image/*,audio/*,.pdf,.doc,.docx"
            @change="handleFileSelect"
          />
          <div class="p-2 rounded-full hover:bg-muted-100 dark:hover:bg-muted-700/30 transition-colors">
            <Icon name="ph:paperclip" class="size-6 text-muted-500 dark:text-muted-400" />
          </div>
        </label>

        <!-- Input field -->
        <div class="flex-1 bg-muted-50 dark:bg-[#181818] rounded-lg">
          <input
            v-model="messageText"
            type="text"
            placeholder="أكتب رسالة..."
            class="w-full px-4 py-2.5 bg-transparent outline-none text-[15px] text-muted-900 dark:text-white placeholder-muted-400 dark:placeholder-muted-500"
            :disabled="isSending"
            @keydown.enter.exact.prevent="sendMessage"
          />
        </div>

        <!-- Emoji button (optional) -->
        <button
          type="button"
          class="flex-shrink-0 p-2 rounded-full hover:bg-muted-100 dark:hover:bg-muted-700/30 transition-colors"
        >
          <Icon name="ph:smiley" class="size-6 text-muted-500 dark:text-muted-400" />
        </button>

        <!-- Send/Voice button -->
        <button
          v-if="messageText.trim() || selectedFile"
          type="submit"
          :disabled="isSending"
          class="flex-shrink-0 p-2.5 rounded-full bg-primary-500 hover:bg-primary-600 transition-all"
        >
          <Icon
            v-if="isSending"
            name="svg-spinners:ring-resize"
            class="size-5 text-white"
          />
          <Icon
            v-else
            name="ph:paper-plane-tilt-fill"
            class="size-5 text-white"
          />
        </button>
        <button
          v-else
          type="button"
          class="flex-shrink-0 p-2.5 rounded-full hover:bg-muted-100 dark:hover:bg-muted-700/30 transition-colors"
        >
          <Icon name="ph:microphone" class="size-5 text-muted-500 dark:text-muted-400" />
        </button>
      </form>
    </div>
  </div>
</template>

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
