# Chat System - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
1. Backend API running at `https://almawsua-dashboard.taco5k.site`
2. Valid JWT authentication token
3. User account (admin or regular user)

### Installation
The chat dependencies are already installed:
```json
{
  "@microsoft/signalr": "^8.0.17",
  "axios": "^1.7.2"
}
```

## 🎯 Basic Usage

### 1. Using the Chat Page
Navigate to `/chats` to access the full chat interface:

```vue
<template>
  <!-- Just navigate to the page -->
  <NuxtLink to="/chats">Open Chats</NuxtLink>
</template>
```

The chat page handles everything automatically:
- SignalR connection initialization
- Conversation list loading
- Real-time message updates
- Unread count tracking

### 2. Using Chat Composables

#### useSignalR Composable
```typescript
import { useSignalR } from '~/composables/useSignalR'

const signalR = useSignalR()
const userStore = useAppUserStore()

// Initialize connection
const token = await userStore.getToken()
await signalR.initializeConnection(token)

// Listen for messages
signalR.onReceiveMessage((message) => {
  console.log('New message:', message)
})

// Send typing indicator
await signalR.sendTypingIndicator(true, userId)

// Check connection status
const isConnected = signalR.isConnected()

// Cleanup
signalR.offAll()
await signalR.stopConnection()
```

#### useChat Composable
```typescript
import { useChat } from '~/composables/useChat'
import { MessageType } from '~/types/messages'

const chat = useChat()

// Load conversations (admin)
await chat.loadConversations()

// Load message history
await chat.loadMessageHistory(userId)

// Send text message
await chat.sendTextMessage('Hello!', userId)

// Send image
const file = // ... file from input
await chat.sendMessageWithAttachment(
  'Check this out',
  file,
  MessageType.Image,
  userId
)

// Mark messages as read
await chat.markMessagesAsRead([messageId1, messageId2])

// Get unread count
await chat.getUnreadCount()

// Access state
const messages = chat.messages
const unreadCount = chat.unreadCountValue
const isUserOnline = chat.isUserOnline(userId)
```

### 3. Using ChatWindow Component

```vue
<template>
  <ChatWindow
    :user-id="selectedUserId"
    :user-name="selectedUserName"
    @close="onCloseChat"
  />
</template>

<script setup lang="ts">
const selectedUserId = ref('user-guid-here')
const selectedUserName = ref('John Doe')

const onCloseChat = () => {
  selectedUserId.value = null
}
</script>
```

## 📝 Common Patterns

### Pattern 1: Admin Chat Dashboard
```vue
<script setup lang="ts">
const chat = useChat()
const signalR = useSignalR()
const userStore = useAppUserStore()

onMounted(async () => {
  // Initialize SignalR
  const token = await userStore.getToken()
  await signalR.initializeConnection(token)

  // Load conversations
  await chat.loadConversations()

  // Listen for new messages
  signalR.onReceiveMessage((message) => {
    chat.handleIncomingMessage(message)
  })
})

onUnmounted(() => {
  signalR.offAll()
})
</script>

<template>
  <div class="chat-dashboard">
    <!-- Conversations List -->
    <div class="conversations">
      <div
        v-for="conv in chat.conversationsList"
        :key="conv.userId"
        @click="selectConversation(conv)"
      >
        {{ conv.userName }}
        <span v-if="conv.unreadCount">
          {{ conv.unreadCount }}
        </span>
      </div>
    </div>

    <!-- Chat Window -->
    <ChatWindow
      v-if="selectedUserId"
      :user-id="selectedUserId"
      :user-name="selectedUserName"
    />
  </div>
</template>
```

### Pattern 2: User Support Chat
```vue
<script setup lang="ts">
const chat = useChat()
const signalR = useSignalR()
const userStore = useAppUserStore()

onMounted(async () => {
  // Initialize SignalR
  const token = await userStore.getToken()
  await signalR.initializeConnection(token)

  // Load user's message history (with admin)
  await chat.loadMessageHistory()

  // Listen for admin responses
  signalR.onReceiveMessage((message) => {
    if (message.isAdminMessage) {
      chat.handleIncomingMessage(message)
      // Show notification if app is in background
      showNotification('New message from support', message.content)
    }
  })
})

const sendMessage = async (text: string) => {
  await chat.sendTextMessage(text, null) // null = send to admin
}
</script>

<template>
  <div class="support-chat">
    <!-- Messages -->
    <div class="messages">
      <div
        v-for="msg in chat.messages"
        :key="msg.id"
        :class="msg.isAdminMessage ? 'admin-message' : 'user-message'"
      >
        {{ msg.content }}
      </div>
    </div>

    <!-- Input -->
    <input
      v-model="messageText"
      @keydown.enter="sendMessage(messageText)"
      placeholder="Type a message..."
    />
  </div>
</template>
```

### Pattern 3: Notification Badge
```vue
<script setup lang="ts">
const chat = useChat()
const signalR = useSignalR()

onMounted(async () => {
  // Get initial unread count
  await chat.getUnreadCount()

  // Listen for new messages
  signalR.onReceiveMessage((message) => {
    if (!message.isRead && !message.isAdminMessage) {
      chat.handleIncomingMessage(message)
    }
  })
})
</script>

<template>
  <NuxtLink to="/chats">
    <Icon name="ph:chats" />
    <span v-if="chat.unreadCountValue > 0" class="badge">
      {{ chat.unreadCountValue }}
    </span>
  </NuxtLink>
</template>
```

## 🔧 Advanced Features

### Send File with Progress
```typescript
const sendFile = async (file: File) => {
  const formData = new FormData()
  formData.append('Attachment', file)
  formData.append('Content', 'File attached')
  formData.append('Type', MessageType.File.toString())

  const config = {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      )
      console.log('Upload progress:', percentCompleted)
    }
  }

  const apiPaths = useApiPaths()
  await axios.post(apiPaths.sendMessageWithAttachment, formData, config)
}
```

### Typing Indicator with Debounce
```typescript
let typingTimeout: NodeJS.Timeout | null = null

const handleTyping = (isTyping: boolean) => {
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }

  if (isTyping) {
    signalR.sendTypingIndicator(true, userId)
    
    typingTimeout = setTimeout(() => {
      signalR.sendTypingIndicator(false, userId)
    }, 3000) // Stop after 3 seconds of no typing
  } else {
    signalR.sendTypingIndicator(false, userId)
  }
}

// In template
<input
  @input="handleTyping(true)"
  @blur="handleTyping(false)"
/>
```

### Auto-mark Messages as Read
```typescript
const messagesContainer = ref<HTMLElement>()

const checkMessagesInView = () => {
  const unreadIds = chat.messages.value
    .filter(m => !m.isRead && !m.isAdminMessage)
    .map(m => m.id)

  if (unreadIds.length > 0) {
    chat.markMessagesAsRead(unreadIds)
  }
}

// Watch for scroll or new messages
watch(() => chat.messages.value.length, () => {
  nextTick(() => {
    if (messagesContainer.value) {
      checkMessagesInView()
    }
  })
})
```

## 🎨 Styling Tips

### Telegram-Style Message Bubbles
```css
.message {
  max-width: 70%;
  padding: 8px 12px;
  border-radius: 12px;
  word-wrap: break-word;
}

.message.admin {
  background: #0088cc;
  color: white;
  margin-left: auto;
  border-bottom-right-radius: 4px;
}

.message.user {
  background: white;
  color: #000;
  margin-right: auto;
  border-bottom-left-radius: 4px;
}
```

### Unread Badge
```css
.unread-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: #0088cc;
  color: white;
  border-radius: 10px;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-center;
}
```

## 🐛 Troubleshooting

### Issue: Messages not appearing in real-time
**Solution**: Check SignalR connection status
```typescript
console.log('SignalR state:', signalR.getConnectionState())
// Should be "Connected"

if (!signalR.isConnected()) {
  const token = await userStore.getToken()
  await signalR.initializeConnection(token)
}
```

### Issue: Properties are undefined
**Solution**: The composable already handles normalization, but check:
```typescript
console.log('Message received:', message)
// Backend sends PascalCase, composable normalizes to camelCase
```

### Issue: File upload fails
**Solution**: Check file size and type
```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

if (file.size > MAX_FILE_SIZE) {
  alert('File too large')
  return
}

const allowedTypes = ['image/*', 'audio/*', 'application/pdf']
// Validate file type
```

### Issue: SignalR disconnects frequently
**Solution**: Check network and authentication
```typescript
signalR.connection.onreconnecting((error) => {
  console.warn('Reconnecting...', error)
  // Show UI indicator
})

signalR.connection.onreconnected(() => {
  console.log('Reconnected')
  // Refresh messages
  chat.loadMessageHistory()
})
```

## 📱 Mobile Considerations

### Responsive Chat Layout
```vue
<template>
  <div class="chat-container">
    <!-- Mobile: Full width, stack vertically -->
    <div
      class="conversations"
      :class="{ 'hidden md:block': selectedUserId }"
    >
      <!-- Conversations list -->
    </div>

    <div
      class="chat-window"
      :class="{ 'hidden md:block': !selectedUserId }"
    >
      <!-- Chat window -->
    </div>
  </div>
</template>

<style>
@media (min-width: 768px) {
  .chat-container {
    display: flex;
  }

  .conversations {
    width: 380px;
  }

  .chat-window {
    flex: 1;
  }
}
</style>
```

## 🔐 Security Best Practices

1. **Never expose tokens in console logs (production)**
```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('Token:', token)
}
```

2. **Validate user permissions before showing chats**
```typescript
const userStore = useAppUserStore()
if (!userStore.isAuthenticated) {
  navigateTo('/login')
}
```

3. **Sanitize message content**
```typescript
import DOMPurify from 'dompurify'

const sanitizedContent = DOMPurify.sanitize(message.content)
```

## 📊 Performance Tips

1. **Lazy load message history**
```typescript
const loadMore = async () => {
  await chat.loadMessageHistory(userId, true) // loadMore = true
}
```

2. **Debounce search**
```typescript
const debouncedSearch = useDebounceFn((query: string) => {
  // Perform search
}, 300)
```

3. **Virtualize long lists** (for thousands of messages)
```vue
<RecycleScroller
  :items="chat.messages"
  :item-size="80"
  key-field="id"
>
  <template #default="{ item }">
    <MessageBubble :message="item" />
  </template>
</RecycleScroller>
```

---

**Ready to build!** 🚀

For more details, see [CHAT_IMPLEMENTATION_COMPLETE.md](./CHAT_IMPLEMENTATION_COMPLETE.md)
