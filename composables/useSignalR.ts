// composables/useSignalR.ts
import * as signalR from '@microsoft/signalr'

export const useSignalR = () => {
  // Shared across every caller in the app — one SignalR connection per tab.
  const connection = useState<signalR.HubConnection | null>('signalr-chat-connection', () => null)
  const isConnected = useState<boolean>('signalr-chat-isConnected', () => false)
  const connectionError = useState<string | null>('signalr-chat-error', () => null)

  const initializeConnection = async (token: string) => {
    try {
      const config = useRuntimeConfig()
      const hubUrl = `${config.public.assetsUrl}/chat`

      connection.value = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => token,
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            if (retryContext.elapsedMilliseconds < 60000) {
              return Math.random() * 10000
            } else {
              return null
            }
          }
        })
        .configureLogging(signalR.LogLevel.Information)
        .build()

      // Connection events
      connection.value.onreconnecting((error) => {
        console.log('SignalR reconnecting...', error)
        isConnected.value = false
      })

      connection.value.onreconnected((connectionId) => {
        console.log('SignalR reconnected:', connectionId)
        isConnected.value = true
        connectionError.value = null
      })

      connection.value.onclose((error) => {
        console.log('SignalR connection closed:', error)
        isConnected.value = false
        if (error) {
          connectionError.value = error.message
        }
      })

      await connection.value.start()
      isConnected.value = true
      connectionError.value = null
      console.log('SignalR Connected!')

      return connection.value
    } catch (error: any) {
      console.error('SignalR Connection Error:', error)
      isConnected.value = false
      connectionError.value = error.message
      throw error
    }
  }

  const stopConnection = async () => {
    if (connection.value) {
      try {
        await connection.value.stop()
      } catch (error) {
        console.error('Error stopping SignalR connection:', error)
      } finally {
        connection.value = null
        isConnected.value = false
        console.log('SignalR connection stopped')
      }
    }
  }

  const onReceiveMessage = (callback: (message: any) => void) => {
    if (connection.value) {
      console.log('🎧 SignalR: Attaching ReceiveMessage listener')
      connection.value.on('ReceiveMessage', (message) => {
        console.log('🔔 SignalR: ReceiveMessage event fired:', message)
        callback(message)
      })
    } else {
      console.warn('⚠️ SignalR: Cannot attach listener, connection is null')
    }
  }

  const onUserTyping = (callback: (data: { userId: string; isTyping: boolean }) => void) => {
    if (connection.value) {
      // Backend sends 'TypingIndicator' event
      connection.value.on('TypingIndicator', callback)
    }
  }

  const onMessagesRead = (callback: (data: { messageIds: string[]; readAt: string }) => void) => {
    if (connection.value) {
      connection.value.on('MessagesRead', (data: any) => {
        const rawIds = data?.MessageIds ?? data?.messageIds ?? []
        const messageIds = Array.isArray(rawIds)
          ? rawIds.map((id: any) => String(id))
          : []
        const readAt = data?.ReadAt ?? data?.readAt ?? new Date().toISOString()
        callback({ messageIds, readAt })
      })
    }
  }

  const sendTypingIndicator = async (userId: string, isTyping: boolean) => {
    if (connection.value && isConnected.value) {
      try {
        // Backend hub method is 'SendTypingIndicator' with (isTyping, toUserId) params
        await connection.value.invoke('SendTypingIndicator', isTyping, userId)
      } catch (error) {
        console.error('Error sending typing indicator:', error)
      }
    }
  }

  const offReceiveMessage = () => {
    if (connection.value) {
      connection.value.off('ReceiveMessage')
    }
  }

  const offUserTyping = () => {
    if (connection.value) {
      connection.value.off('TypingIndicator')
    }
  }

  const offMessagesRead = () => {
    if (connection.value) {
      connection.value.off('MessagesRead')
    }
  }

  // === Notification Hub (separate connection) ===
  const notifConnection = useState<signalR.HubConnection | null>('signalr-notif-connection', () => null)

  const initializeNotificationHub = async (token: string) => {
    try {
      const config = useRuntimeConfig()
      const hubUrl = `${config.public.assetsUrl}/notificationHub`

      notifConnection.value = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => token,
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets
        })
        .withAutomaticReconnect()
        .build()

      await notifConnection.value.start()
      return notifConnection.value
    } catch {
      // Notification hub connection failed - non-critical
    }
  }

  const onReceiveNotification = (callback: (notification: any) => void) => {
    if (notifConnection.value) {
      notifConnection.value.on('ReceiveNotification', callback)
    }
  }

  const offReceiveNotification = () => {
    if (notifConnection.value) {
      notifConnection.value.off('ReceiveNotification')
    }
  }

  const stopNotificationHub = async () => {
    if (notifConnection.value) {
      try {
        await notifConnection.value.stop()
      } catch {
        // Silently handle
      } finally {
        notifConnection.value = null
      }
    }
  }

  return {
    connection,
    isConnected,
    connectionError,
    initializeConnection,
    stopConnection,
    onReceiveMessage,
    onUserTyping,
    onMessagesRead,
    sendTypingIndicator,
    offReceiveMessage,
    offUserTyping,
    offMessagesRead,
    initializeNotificationHub,
    onReceiveNotification,
    offReceiveNotification,
    stopNotificationHub
  }
}

