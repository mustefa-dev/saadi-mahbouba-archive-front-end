<script setup lang="ts">
import axios from '~/services/app-client/axios';
import type { Message, MessagesResponse } from '~/types/messages';
import { MessageType } from '~/types/messages';
import { formatDateAndTime } from '~/utils/helpers';

const route = useRoute();
const userStore = useAppUserStore();
const helpers = useHelpers();
const signalR = useSignalR();

const userId = route.params.id as string;
const messages = ref<Message[]>([]);
const userName = ref('');
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

useHead({
  title: computed(() => `محادثة مع ${userName.value}`)
})

// Fetch messages
const fetchMessages = async (loadMore = false) => {
  isLoading.value = true;
  try {
    const apiPaths = useApiPaths();
    const response = await axios.get<MessagesResponse>(
      apiPaths.conversationById(userId),
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

// Fetch user info
const fetchUserInfo = async () => {
  try {
    const apiPaths = useApiPaths();
    const response = await axios.get(apiPaths.userById(userId));
    userName.value = response.data.fullName || 'مستخدم';
  } catch (error) {
    userName.value = 'مستخدم';
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
      formData.append('ToUserId', userId);

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
        toUserId: userId,
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
        if (message.fromUserId === userId || message.toUserId === userId) {
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
        if (typingUserId === userId) {
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
  await fetchUserInfo();
  await fetchMessages();
  await initSignalR();

  onUnmounted(() => {
    signalR.offReceiveMessage();
    signalR.offUserTyping();
    signalR.offMessageRead();
    signalR.stopConnection();
  });
});
</script>

<template>
  <div class="fixed inset-0 flex flex-col bg-muted-50 dark:bg-muted-950 z-50">
    <!-- Header - Fixed at top -->
    <div class="flex-shrink-0 bg-white dark:bg-muted-900 border-b border-muted-200 dark:border-muted-800 px-4 py-3 shadow-sm z-10">
      <div class="flex items-center gap-3">
        <BaseButtonIcon
          size="sm"
          @click="$router.back()"
        >
          <Icon name="ph:arrow-right" class="size-5" />
        </BaseButtonIcon>

        <div class="flex items-center justify-center size-12 rounded-full bg-primary-500 text-white font-semibold text-lg">
          {{ userName.charAt(0).toUpperCase() }}
        </div>

        <div class="flex-1">
          <h3 class="font-semibold text-muted-900 dark:text-white">
            {{ userName }}
          </h3>
          <p v-if="isTyping" class="text-xs text-primary-500 animate-pulse">
            يكتب...
          </p>
        </div>
      </div>
    </div>

    <!-- Messages Container - Scrollable middle section -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto px-4 py-6 space-y-3"
      style="background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwMDAwMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==');"
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
        class="flex items-end gap-2"
        :class="message.isAdminMessage ? 'justify-end' : 'justify-start'"
      >
        <div
          class="max-w-[75%] sm:max-w-[60%] rounded-2xl px-3 py-2 shadow-sm"
          :class="message.isAdminMessage
            ? 'bg-primary-500 text-white rounded-br-sm'
            : 'bg-white dark:bg-muted-800 text-muted-900 dark:text-white rounded-bl-sm'"
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

          <!-- Timestamp and Status -->
          <div class="flex items-center justify-end gap-1 mt-1">
            <span class="text-[10px] opacity-70 whitespace-nowrap">
              {{ formatDateAndTime(message.sentAt) }}
            </span>
            <Icon
              v-if="message.isAdminMessage"
              :name="message.isRead ? 'ph:checks' : 'ph:check'"
              class="size-3.5"
              :class="message.isRead ? 'text-blue-300' : 'opacity-70'"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Input Area - Fixed at bottom -->
    <div class="flex-shrink-0 bg-white dark:bg-muted-900 border-t border-muted-200 dark:border-muted-800 px-4 py-3 shadow-lg">
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

      <!-- Input Form -->
      <form @submit.prevent="sendMessage" class="flex items-end gap-2">
        <label class="cursor-pointer flex-shrink-0">
          <input
            type="file"
            class="hidden"
            accept="image/*,audio/*,.pdf,.doc,.docx"
            @change="handleFileSelect"
          />
          <div class="p-2.5 rounded-full hover:bg-muted-100 dark:hover:bg-muted-800 transition-colors">
            <Icon name="ph:paperclip" class="size-6 text-muted-500" />
          </div>
        </label>

        <div class="flex-1 bg-muted-100 dark:bg-muted-800 rounded-2xl px-4 py-2.5">
          <input
            v-model="messageText"
            type="text"
            placeholder="اكتب رسالة..."
            class="w-full bg-transparent outline-none text-muted-900 dark:text-white placeholder-muted-400"
            :disabled="isSending"
            @keydown.enter.exact.prevent="sendMessage"
          />
        </div>

        <button
          type="submit"
          :disabled="isSending || (!messageText.trim() && !selectedFile)"
          class="flex-shrink-0 p-3 rounded-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
      </form>
    </div>
  </div>
</template>
