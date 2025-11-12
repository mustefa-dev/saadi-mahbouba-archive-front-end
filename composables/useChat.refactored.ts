// DEPRECATED - DO NOT USE
// This file has been replaced by useChat.ts
// Keeping for backup purposes only

import type {
  Message,
  Conversation,
  MessageHistoryResponse,
  ConversationsResponse,
  SendMessageRequest,
  MessageResponse,
  UnreadCountResponse,
  ApiResponse,
  DeleteMessageResponse
} from '~/types/messages'
import { MessageType } from '~/types/messages'
import axios from '~/services/app-client/axios'

export const useChatOld = () => {
  const {
    messageHistory,
    sendMessage,
    sendWithAttachment,
    unreadCount,
    markRead,
    markDelivered,
    conversations,
    conversation,
    messageById,
    deleteMessage: deleteMessagePath
  } = useApiPaths()

  // State
  const messages = ref<Message[]>([])
  const conversationsList = ref<Conversation[]>([])
  const unreadCountValue = ref(0)
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const isSending = ref(false)
  const currentConversationUserId = ref<string | null>(null)
  const typingUsers = ref<Set<string>>(new Set())
  const onlineUsers = ref<Set<string>>(new Set())

  // Pagination
  const pageNumber = ref(0)
  const pageSize = ref(50)
  const hasMoreMessages = ref(true)
  const totalCount = ref(0)

  // Conversations Pagination
  const conversationsPageNumber = ref(0)
  const conversationsPageSize = ref(20)
  const hasMoreConversations = ref(true)

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

      const params = new URLSearchParams({
        pageNumber: pageNumber.value.toString(),
        pageSize: pageSize.value.toString(),
      })

      let url = messageHistory
      if (userId) {
        url = conversation(userId) + '?' + params.toString()
      } else {
        url += '?' + params.toString()
      }

      const response = await axios.get<MessageHistoryResponse>(url)

      if (response.data.data) {
        const newMessages = response.data.data
        if (loadMore) {
          // Prepend older messages
          messages.value = [...newMessages, ...messages.value]
        } else {
          messages.value = newMessages
        }

        totalCount.value = response.data.totalCount || 0

        // Check if there are more messages
        hasMoreMessages.value = newMessages.length === pageSize.value
      }
    } catch (error) {
      console.error('Failed to load message history:', error)
      useToast({ message: 'Failed to load message history', isError: true })
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
        conversationsPageNumber.value++
      } else {
        isLoading.value = true
        conversationsPageNumber.value = 0
        conversationsList.value = []
        hasMoreConversations.value = true
      }

      const params = new URLSearchParams({
        pageNumber: conversationsPageNumber.value.toString(),
        pageSize: conversationsPageSize.value.toString(),
      })

      const response = await axios.get<ConversationsResponse>(conversations + '?' + params.toString())

      if (response.data.data) {
        if (loadMore) {
          conversationsList.value.push(...response.data.data)
        } else {
          conversationsList.value = response.data.data
        }

        // Check if there are more conversations
        hasMoreConversations.value = response.data.data.length === conversationsPageSize.value
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
      useToast({ message: 'Failed to load conversations', isError: true })
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Send text message
  const sendTextMessage = async (content: string, toUserId: string | null = null): Promise<Message> => {
    try {
      isSending.value = true

      const request: SendMessageRequest = {
        content,
        type: MessageType.Text,
        attachmentUrl: null,
        toUserId,
      }

      // Remove toUserId if it's null (for sending to admin)
      if (toUserId === null) {
        delete (request as any).toUserId
      }

      const response = await axios.post<MessageResponse>(sendMessage, request)

      if (response.data.data) {
        // Add to local messages
        messages.value.push(response.data.data)

        // Update conversation list if needed
        updateConversationsList(response.data.data)

        return response.data.data
      }

      throw new Error('No data in response')
    } catch (error: any) {
      console.error('Failed to send message:', error)
      const errorMessage = error.response?.data?.message || 'Failed to send message'
      useToast({ message: errorMessage, isError: true })
      throw error
    } finally {
      isSending.value = false
    }
  }

  // Send message with attachment
  const sendMessageWithAttachment = async (
    content: string,
    file: File,
    type: MessageType,
    toUserId: string | null = null
  ): Promise<Message> => {
    try {
      isSending.value = true

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        throw new Error('File size exceeds 10MB limit')
      }

      const formData = new FormData()
      formData.append('Content', content)
      formData.append('Type', type.toString())
      formData.append('Attachment', file)

      // Only append ToUserId if it's not null
      if (toUserId !== null) {
        formData.append('ToUserId', toUserId)
      }

      const response = await axios.post<MessageResponse>(sendWithAttachment, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.data) {
        messages.value.push(response.data.data)

        // Update conversation list if needed
        updateConversationsList(response.data.data)

        return response.data.data
      }

      throw new Error('No data in response')
    } catch (error: any) {
      console.error('Failed to send message with attachment:', error)
      const errorMessage = error.response?.data?.message || 'Failed to send message with attachment'
      useToast({ message: errorMessage, isError: true })
      throw error
    } finally {
      isSending.value = false
    }
  }

  // Mark messages as read
  const markMessagesAsRead = async (messageIds: string[]) => {
    if (messageIds.length === 0) return

    try {
      await axios.post<ApiResponse<boolean>>(markRead, messageIds)

      // Update local messages
      messages.value.forEach(msg => {
        if (messageIds.includes(msg.id)) {
          msg.isRead = true
          msg.readAt = new Date().toISOString()
        }
      })

      // Update unread count
      await getUnreadCount()
    } catch (error) {
      console.error('Failed to mark messages as read:', error)
      throw error
    }
  }

  // Mark message as delivered
  const markMessageAsDelivered = async (messageId: string) => {
    try {
      await axios.put<ApiResponse<boolean>>(markDelivered(messageId))
    } catch (error) {
      console.error('Failed to mark message as delivered:', error)
      throw error
    }
  }

  // Get unread count
  const getUnreadCount = async () => {
    try {
      const response = await axios.get<UnreadCountResponse>(unreadCount)
      if (typeof response.data.data === 'number') {
        unreadCountValue.value = response.data.data
      }
    } catch (error) {
      console.error('Failed to get unread count:', error)
      throw error
    }
  }

  // Get message by ID
  const getMessageById = async (id: string): Promise<Message | null> => {
    try {
      const response = await axios.get<MessageResponse>(messageById(id))
      return response.data.data || null
    } catch (error: any) {
      console.error('Failed to get message by ID:', error)
      const errorMessage = error.response?.data?.message || 'Failed to get message'
      useToast({ message: errorMessage, isError: true })
      throw error
    }
  }

  // Delete message
  const deleteMessage = async (id: string): Promise<boolean> => {
    try {
      const response = await axios.delete<DeleteMessageResponse>(deleteMessagePath(id))

      if (response.data.data) {
        // Remove from local messages
        const index = messages.value.findIndex(msg => msg.id === id)
        if (index !== -1) {
          messages.value.splice(index, 1)
        }

        useToast({ message: 'Message deleted successfully', title: 'Success' })
        return true
      }

      return false
    } catch (error: any) {
      console.error('Failed to delete message:', error)
      const errorMessage = error.response?.data?.message || 'Failed to delete message'
      useToast({ message: errorMessage, isError: true })
      throw error
    }
  }

  // Set current conversation
  const setCurrentConversation = (userId: string | null) => {
    currentConversationUserId.value = userId
    pageNumber.value = 0
    messages.value = []
    hasMoreMessages.value = true
    totalCount.value = 0
  }

  // Handle incoming message from SignalR
  const handleIncomingMessage = (message: Message) => {
    // Check if message is already in the list (avoid duplicates)
    const exists = messages.value.find(msg => msg.id === message.id)
    if (exists) return

    // If it's for the current conversation, add it
    if (!currentConversationUserId.value ||
        message.fromUserId === currentConversationUserId.value ||
        message.toUserId === currentConversationUserId.value) {
      messages.value.push(message)
    }

    // Update conversation list
    updateConversationsList(message)

    // Update unread count if message is not read
    if (!message.isRead) {
      unreadCountValue.value++
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

  // Handle user online status
  const handleUserOnline = (user: { userId: string }) => {
    onlineUsers.value.add(user.userId)
  }

  // Handle user offline status
  const handleUserOffline = (user: { userId: string }) => {
    onlineUsers.value.delete(user.userId)
  }

  // Update conversations list with new message
  const updateConversationsList = (message: Message) => {
    const userId = message.isAdminMessage ? message.toUserId : message.fromUserId
    if (!userId) return

    const convIndex = conversationsList.value.findIndex(c => c.userId === userId)

    if (convIndex !== -1) {
      // Update existing conversation
      const conversation = conversationsList.value[convIndex]
      conversation.lastMessage = message.content
      conversation.lastMessageTime = message.sentAt

      if (!message.isRead && message.toUserId) {
        conversation.unreadCount++
      }

      // Move to top
      conversationsList.value.splice(convIndex, 1)
      conversationsList.value.unshift(conversation)
    } else {
      // Add new conversation (if we can get user info from message)
      const newConv: Conversation = {
        userId: userId,
        userName: message.fromUserName || 'Unknown User',
        lastMessage: message.content,
        lastMessageTime: message.sentAt,
        unreadCount: message.isRead ? 0 : 1
      }
      conversationsList.value.unshift(newConv)
    }
  }

  // Clear current conversation
  const clearCurrentConversation = () => {
    currentConversationUserId.value = null
    messages.value = []
    pageNumber.value = 0
    hasMoreMessages.value = true
  }

  return {
    // State
    messages: readonly(messages),
    conversationsList: readonly(conversationsList),
    unreadCountValue: readonly(unreadCountValue),
    isLoading: readonly(isLoading),
    isLoadingMore: readonly(isLoadingMore),
    isSending: readonly(isSending),
    currentConversationUserId: readonly(currentConversationUserId),
    typingUsers: readonly(typingUsers),
    onlineUsers: readonly(onlineUsers),
    hasMoreMessages: readonly(hasMoreMessages),
    hasMoreConversations: readonly(hasMoreConversations),
    totalCount: readonly(totalCount),

    // Actions
    loadMessageHistory,
    loadConversations,
    sendTextMessage,
    sendMessageWithAttachment,
    markMessagesAsRead,
    markMessageAsDelivered,
    getUnreadCount,
    getMessageById,
    deleteMessage,
    setCurrentConversation,
    clearCurrentConversation,
    handleIncomingMessage,
    handleTypingIndicator,
    handleUserOnline,
    handleUserOffline,
  }
}

