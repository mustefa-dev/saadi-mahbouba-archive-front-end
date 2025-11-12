// DEPRECATED - DO NOT USE
// This file has been replaced by useSignalR.ts

import { HubConnectionBuilder, LogLevel, HubConnection, HubConnectionState } from '@microsoft/signalr'
import type { Message, TypingIndicator, UserConnection } from '~/types/messages'

export const useSignalROld = () => {
  const { chatHub } = useApiPaths()
  const userStore = useAppUserStore()
  const { $emitter } = useNuxtApp()

  let connection: HubConnection | null = null
  const isConnected = ref(false)
  const isReconnecting = ref(false)
  const connectionError = ref<string | null>(null)
  const reconnectAttempts = ref(0)
  const maxReconnectAttempts = 5

  const connect = async () => {
    if (connection && connection.state === HubConnectionState.Connected) {
      console.log('✅ SignalR already connected')
      return
    }

    try {
      console.log('🔄 Connecting to SignalR hub...')
      connectionError.value = null

      connection = new HubConnectionBuilder()
        .withUrl(chatHub, {
          accessTokenFactory: () => userStore.getToken() || '',
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            // Exponential backoff: 2s, 4s, 8s, 16s, 30s
            if (retryContext.previousRetryCount >= maxReconnectAttempts) {
              return null // Stop reconnecting
            }
            return Math.min(2000 * Math.pow(2, retryContext.previousRetryCount), 30000)
          }
        })
        .configureLogging(LogLevel.Information)
        .build()

      // Register event listeners
      setupEventListeners()

      // Connection lifecycle events
      connection.onclose((error) => {
        isConnected.value = false
        isReconnecting.value = false
        connectionError.value = error?.message || 'Connection closed'
        console.log('❌ SignalR connection closed:', error)
        $emitter.emit('signalRDisconnected')
      })

      connection.onreconnecting((error) => {
        isReconnecting.value = true
        reconnectAttempts.value++
        console.log(`🔄 Reconnecting... (Attempt ${reconnectAttempts.value})`)
        $emitter.emit('signalRReconnecting')
      })

      connection.onreconnected((connectionId) => {
        isReconnecting.value = false
        isConnected.value = true
        reconnectAttempts.value = 0
        connectionError.value = null
        console.log('✅ SignalR reconnected:', connectionId)
        useToast({ message: 'Reconnected to chat', title: 'Connected' })
        $emitter.emit('signalRReconnected')
      })

      await connection.start()
      isConnected.value = true
      reconnectAttempts.value = 0
      console.log('✅ Connected to SignalR hub')
      useToast({ message: 'Connected to chat server', title: 'Connected' })
    } catch (error: any) {
      console.error('❌ SignalR connection failed:', error)
      connectionError.value = error.message
      isConnected.value = false
      useToast({ message: 'Failed to connect to chat server', isError: true })

      // Retry connection after a delay
      if (reconnectAttempts.value < maxReconnectAttempts) {
        reconnectAttempts.value++
        const delay = Math.min(5000 * reconnectAttempts.value, 30000)
        console.log(`⏳ Retrying connection in ${delay}ms...`)
        setTimeout(() => connect(), delay)
      }
    }
  }

  const setupEventListeners = () => {
    if (!connection) return

    // Receive new message
    connection.on('ReceiveMessage', (message: Message) => {
      console.log('📨 Received message:', message)
      $emitter.emit('messageReceived', message)

      // Play notification sound if available
      playNotificationSound()
    })

    // User came online
    connection.on('UserOnline', (user: UserConnection) => {
      console.log('🟢 User online:', user.userId)
      $emitter.emit('userOnline', user)
    })

    // User went offline
    connection.on('UserOffline', (user: UserConnection) => {
      console.log('⚫ User offline:', user.userId)
      $emitter.emit('userOffline', user)
    })

    // Typing indicator
    connection.on('TypingIndicator', (indicator: TypingIndicator) => {
      console.log('✍️ Typing indicator:', indicator)
      $emitter.emit('typingIndicator', indicator)
    })

    // Message read receipt
    connection.on('MessageRead', (data: { messageId: string; userId: string }) => {
      console.log('✓✓ Message read:', data)
      $emitter.emit('messageRead', data)
    })

    // Message delivered receipt
    connection.on('MessageDelivered', (data: { messageId: string; userId: string }) => {
      console.log('✓ Message delivered:', data)
      $emitter.emit('messageDelivered', data)
    })
  }

  const disconnect = async () => {
    if (connection) {
      try {
        await connection.stop()
        console.log('🔌 SignalR disconnected')
      } catch (error) {
        console.error('Error disconnecting SignalR:', error)
      } finally {
        connection = null
        isConnected.value = false
        isReconnecting.value = false
      }
    }
  }

  const sendTypingIndicator = async (isTyping: boolean, toUserId: string | null = null) => {
    if (!connection || connection.state !== HubConnectionState.Connected) {
      console.warn('⚠️ Cannot send typing indicator: Not connected')
      return
    }

    try {
      await connection.invoke('SendTypingIndicator', { isTyping, toUserId })
    } catch (error) {
      console.error('Failed to send typing indicator:', error)
    }
  }

  const messageDelivered = async (messageId: string) => {
    if (!connection || connection.state !== HubConnectionState.Connected) {
      console.warn('⚠️ Cannot send delivery receipt: Not connected')
      return
    }

    try {
      await connection.invoke('MessageDelivered', { messageId })
    } catch (error) {
      console.error('Failed to mark message as delivered:', error)
    }
  }

  const messagesRead = async (messageIds: string[]) => {
    if (!connection || connection.state !== HubConnectionState.Connected) {
      console.warn('⚠️ Cannot send read receipt: Not connected')
      return
    }

    try {
      await connection.invoke('MessagesRead', { messageIds })
    } catch (error) {
      console.error('Failed to mark messages as read:', error)
    }
  }

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/assets/notification.mp3')
      audio.volume = 0.5
      audio.play().catch(err => console.log('Could not play notification sound:', err))
    } catch (error) {
      console.log('Notification sound not available')
    }
  }

  const retryConnection = async () => {
    reconnectAttempts.value = 0
    await connect()
  }

  // Auto-connect when composable is used (only if user is authenticated)
  onMounted(() => {
    if (userStore.user.token) {
      connect()
    }
  })

  // Disconnect on unmount
  onUnmounted(() => {
    disconnect()
  })

  // Watch for authentication changes
  watch(() => userStore.user.token, (newToken, oldToken) => {
    if (newToken && !oldToken) {
      // User just logged in
      connect()
    } else if (!newToken && oldToken) {
      // User just logged out
      disconnect()
    }
  })

  return {
    connection: readonly(connection),
    isConnected: readonly(isConnected),
    isReconnecting: readonly(isReconnecting),
    connectionError: readonly(connectionError),
    reconnectAttempts: readonly(reconnectAttempts),
    connect,
    disconnect,
    retryConnection,
    sendTypingIndicator,
    messageDelivered,
    messagesRead,
  }
}

