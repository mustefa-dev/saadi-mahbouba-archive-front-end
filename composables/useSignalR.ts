// composables/useSignalR.ts
import * as signalR from '@microsoft/signalr'

export const useSignalR = () => {
  const connection = ref<signalR.HubConnection | null>(null)
  const isConnected = ref(false)
  const connectionError = ref<string | null>(null)

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
        isConnected.value = false
        console.log('SignalR connection stopped')
      } catch (error) {
        console.error('Error stopping SignalR connection:', error)
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

  const onMessageRead = (callback: (data: { messageId: string }) => void) => {
    if (connection.value) {
      connection.value.on('MessageRead', callback)
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

  const sendMessageReadReceipt = async (messageId: string) => {
    if (connection.value && isConnected.value) {
      try {
        await connection.value.invoke('MessageRead', messageId)
      } catch (error) {
        console.error('Error sending read receipt:', error)
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

  const offMessageRead = () => {
    if (connection.value) {
      connection.value.off('MessageRead')
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
    onMessageRead,
    sendTypingIndicator,
    sendMessageReadReceipt,
    offReceiveMessage,
    offUserTyping,
    offMessageRead
  }
}

