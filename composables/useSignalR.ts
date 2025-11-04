/**
 * SignalR Composable
 * Manages WebSocket connection for real-time messaging
 */

import * as signalR from '@microsoft/signalr'

export const useSignalR = () => {
  const config = useRuntimeConfig()
  let connection: signalR.HubConnection | null = null

  /**
   * Initialize SignalR connection with authentication token
   */
  const initializeConnection = async (token: string): Promise<void> => {
    try {
      if (connection) {
        await stopConnection()
      }

      // Use assetsUrl (base server URL) instead of baseUrl (which includes /api)
      const hubUrl = `${config.public.assetsUrl}/chat`;
      console.log('🔌 Connecting to SignalR hub:', hubUrl);

      connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => token,
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: () => Math.random() * 10000
        })
        .configureLogging(signalR.LogLevel.Warning) // Reduce log noise
        .build()

      await connection.start()
      console.log('✅ SignalR Connected successfully')
    } catch (error) {
      console.error('❌ SignalR Connection Error:', error)
      throw error
    }
  }

  /**
   * Stop SignalR connection
   */
  const stopConnection = async (): Promise<void> => {
    if (connection) {
      try {
        await connection.stop()
        console.log('SignalR Disconnected')
      } catch (error) {
        console.error('Error stopping connection:', error)
      }
      connection = null
    }
  }

  /**
   * Listen for incoming messages
   */
  const onReceiveMessage = (callback: (message: any) => void): void => {
    if (connection) {
      connection.on('ReceiveMessage', callback)
    }
  }

  /**
   * Listen for typing indicator
   */
  const onUserTyping = (callback: (userId: string, isTyping: boolean) => void): void => {
    if (connection) {
      connection.on('UserTyping', callback)
    }
  }

  /**
   * Listen for message read receipts
   */
  const onMessageRead = (callback: (messageId: string) => void): void => {
    if (connection) {
      connection.on('MessageRead', callback)
    }
  }

  /**
   * Send typing indicator
   */
  const sendTypingIndicator = async (userId: string, isTyping: boolean): Promise<void> => {
    if (connection) {
      try {
        await connection.invoke('SendTypingIndicator', userId, isTyping)
      } catch (error) {
        console.error('Error sending typing indicator:', error)
      }
    }
  }

  /**
   * Send message read receipt
   */
  const sendMessageReadReceipt = async (messageId: string): Promise<void> => {
    if (connection) {
      try {
        await connection.invoke('MarkMessageAsRead', messageId)
      } catch (error) {
        console.error('Error sending read receipt:', error)
      }
    }
  }

  /**
   * Unsubscribe from message events
   */
  const offReceiveMessage = (): void => {
    if (connection) {
      connection.off('ReceiveMessage')
    }
  }

  /**
   * Unsubscribe from typing events
   */
  const offUserTyping = (): void => {
    if (connection) {
      connection.off('UserTyping')
    }
  }

  /**
   * Unsubscribe from message read events
   */
  const offMessageRead = (): void => {
    if (connection) {
      connection.off('MessageRead')
    }
  }

  /**
   * Get connection state
   */
  const getConnectionState = (): signalR.HubConnectionState | null => {
    return connection?.state || null
  }

  return {
    initializeConnection,
    stopConnection,
    onReceiveMessage,
    onUserTyping,
    onMessageRead,
    sendTypingIndicator,
    sendMessageReadReceipt,
    offReceiveMessage,
    offUserTyping,
    offMessageRead,
    getConnectionState
  }
}
