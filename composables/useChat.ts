import type { Message, Conversation, MessagesResponse, ConversationsResponse, SendMessageRequest } from '~/types/messages'
import { MessageType } from '~/types/messages'
import axios from '~/services/app-client/axios'

export const useChat = () => {
  const apiPaths = useApiPaths()

  // State
  const messages = ref<Message[]>([])
  const conversationsList = ref<Conversation[]>([])
  const unreadCountValue = ref(0)
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const currentConversationUserId = ref<string | null>(null)
  const typingUsers = ref<Set<string>>(new Set())
  const onlineUsers = ref<Set<string>>(new Set())
  const userLastSeen = ref<Map<string, Date>>(new Map())

  // Pagination
  const pageNumber = ref(0)
  const pageSize = ref(50)
  const hasMoreMessages = ref(true)
  const totalCount = ref(0)

  // Load message history
  const loadMessageHistory = async (userId?: string | null, loadMore = false) => {
    try {
      if (loadMore) {
        isLoadingMore.value = true
        pageNumber.value++
      } else {
        isLoading.value = true
        pageNumber.value = 0
        messages.value = []
        hasMoreMessages.value = true
      }

      const params = {
        pageNumber: pageNumber.value,
        pageSize: pageSize.value,
      }

      let url: string
      if (userId) {
        url = apiPaths.conversationById(userId)
      } else {
        url = `${apiPaths.sendMessage.replace('/send', '/history')}`
      }

      const response = await axios.get<MessagesResponse>(url, { params })

      if (response.data.data) {
        const newMessages = response.data.data
        if (loadMore) {
          // Prepend older messages
          messages.value = [...newMessages, ...messages.value]
        } else {
          messages.value = newMessages
        }

        // Update total count and check if more available
        totalCount.value = response.data.totalCount || 0
        hasMoreMessages.value = newMessages.length === pageSize.value && 
                                (pageNumber.value + 1) * pageSize.value < totalCount.value
      }
    } catch (error) {
      console.error('Failed to load message history:', error)
      throw error
    } finally {
      isLoading.value = false
      isLoadingMore.value = false
    }
  }

  // Load conversations (for admin)
  const loadConversations = async (loadMore = false) => {
    try {
      if (loadMore) {
        pageNumber.value++
      } else {
        isLoading.value = true
        pageNumber.value = 0
        conversationsList.value = []
      }

      const params = {
        pageNumber: pageNumber.value,
        pageSize: pageSize.value,
      }

      const response = await axios.get<ConversationsResponse>(apiPaths.conversations, { params })

      if (response.data.data) {
        if (loadMore) {
          conversationsList.value.push(...response.data.data)
        } else {
          conversationsList.value = response.data.data
        }
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Send text message
  const sendTextMessage = async (content: string, toUserId: string | null = null) => {
    try {
      const request: SendMessageRequest = {
        content,
        type: MessageType.TEXT,
        toUserId: toUserId || '',
      }

      const response = await axios.post(apiPaths.sendMessage, request)

      if (response.data.data) {
        // Message will be received via SignalR, but add optimistically
        const message = response.data.data
        if (!messages.value.find(m => m.id === message.id)) {
          messages.value.push(message)
        }
        return message
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      throw error
    }
  }

  // Send message with attachment
  const sendMessageWithAttachment = async (
    content: string, 
    file: File, 
    type: MessageType, 
    toUserId: string | null = null
  ) => {
    try {
      const formData = new FormData()
      formData.append('Content', content)
      formData.append('Type', type.toString())
      formData.append('Attachment', file)

      // Only append ToUserId if it's not null
      if (toUserId !== null) {
        formData.append('ToUserId', toUserId)
      }

      const response = await axios.post(apiPaths.sendMessageWithAttachment, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.data) {
        const message = response.data.data
        if (!messages.value.find(m => m.id === message.id)) {
          messages.value.push(message)
        }
        return message
      }
    } catch (error) {
      console.error('Failed to send message with attachment:', error)
      throw error
    }
  }

  // Mark messages as read
  const markMessagesAsRead = async (messageIds: string[]) => {
    try {
      await axios.post(apiPaths.markMessageRead, messageIds)

      // Update local messages
      messages.value.forEach(msg => {
        if (messageIds.includes(msg.id)) {
          msg.isRead = true
        }
      })

      // Update unread count
      unreadCountValue.value = Math.max(0, unreadCountValue.value - messageIds.length)
    } catch (error) {
      console.error('Failed to mark messages as read:', error)
      throw error
    }
  }

  // Mark message as delivered
  const markMessageAsDelivered = async (messageId: string) => {
    try {
      await axios.put(apiPaths.markMessageDelivered(messageId))
    } catch (error) {
      console.error('Failed to mark message as delivered:', error)
      // Don't throw - delivery status is not critical
    }
  }

  // Get unread count
  const getUnreadCount = async () => {
    try {
      const url = `${apiPaths.sendMessage.replace('/send', '/unread-count')}`
      const response = await axios.get(url)
      if (response.data.data !== undefined) {
        unreadCountValue.value = response.data.data
      }
    } catch (error) {
      console.error('Failed to get unread count:', error)
      throw error
    }
  }

  // Set current conversation
  const setCurrentConversation = (userId: string | null) => {
    currentConversationUserId.value = userId
    pageNumber.value = 0
    messages.value = []
    hasMoreMessages.value = true
  }

  // Handle incoming message from SignalR
  const handleIncomingMessage = (message: Message) => {
    // Avoid duplicates
    if (messages.value.find(m => m.id === message.id)) {
      return
    }

    // If it's for the current conversation, add it
    if (!currentConversationUserId.value ||
        message.fromUserId === currentConversationUserId.value ||
        message.toUserId === currentConversationUserId.value) {
      messages.value.push(message)
    }

    // Update unread count if not read
    if (!message.isRead && !message.isAdminMessage) {
      unreadCountValue.value++
    }

    // Update conversations list
    updateConversationWithMessage(message)
  }

  // Update conversation list when new message arrives
  const updateConversationWithMessage = (message: Message) => {
    const userId = message.isAdminMessage ? message.toUserId : message.fromUserId
    if (!userId) return

    const existingConversation = conversationsList.value.find(c => c.userId === userId)
    if (existingConversation) {
      existingConversation.lastMessage = message.content
      existingConversation.lastMessageTime = message.sentAt
      if (!message.isRead && !message.isAdminMessage) {
        existingConversation.unreadCount++
      }
      // Move to top
      conversationsList.value = [
        existingConversation,
        ...conversationsList.value.filter(c => c.userId !== userId)
      ]
    }
  }

  // Handle typing indicator
  const handleTypingIndicator = (indicator: { userId: string; isTyping: boolean }) => {
    if (indicator.isTyping) {
      typingUsers.value.add(indicator.userId)
    } else {
      typingUsers.value.delete(indicator.userId)
    }
  }

  // Handle user online
  const handleUserOnline = (data: { userId: string; role: string }) => {
    onlineUsers.value.add(data.userId)
    userLastSeen.value.delete(data.userId)
  }

  // Handle user offline
  const handleUserOffline = (data: { userId: string; timestamp: string }) => {
    onlineUsers.value.delete(data.userId)
    userLastSeen.value.set(data.userId, new Date(data.timestamp))
  }

  // Check if user is online
  const isUserOnline = (userId: string): boolean => {
    return onlineUsers.value.has(userId)
  }

  // Get user last seen
  const getUserLastSeen = (userId: string): Date | null => {
    return userLastSeen.value.get(userId) || null
  }

  // Delete message
  const deleteMessage = async (messageId: string) => {
    try {
      const url = `${apiPaths.sendMessage.replace('/send', '')}/${messageId}`
      await axios.delete(url)
      
      // Remove from local messages
      messages.value = messages.value.filter(m => m.id !== messageId)
    } catch (error) {
      console.error('Failed to delete message:', error)
      throw error
    }
  }

  return {
    // State
    messages: readonly(messages),
    conversationsList: readonly(conversationsList),
    unreadCountValue: readonly(unreadCountValue),
    isLoading: readonly(isLoading),
    isLoadingMore: readonly(isLoadingMore),
    currentConversationUserId: readonly(currentConversationUserId),
    typingUsers: readonly(typingUsers),
    hasMoreMessages: readonly(hasMoreMessages),
    totalCount: readonly(totalCount),
    onlineUsers: readonly(onlineUsers),

    // Actions
    loadMessageHistory,
    loadConversations,
    sendTextMessage,
    sendMessageWithAttachment,
    markMessagesAsRead,
    markMessageAsDelivered,
    getUnreadCount,
    setCurrentConversation,
    handleIncomingMessage,
    handleTypingIndicator,
    handleUserOnline,
    handleUserOffline,
    isUserOnline,
    getUserLastSeen,
    deleteMessage,
  }
}
