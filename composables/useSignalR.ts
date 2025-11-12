/**
 * SignalR Composable
 * Manages WebSocket connection for real-time messaging
 * Updated to match .NET backend ChatHub implementation
 */

import * as signalR from '@microsoft/signalr'
import type { Message, TypingIndicator, UserConnection } from '~/types/messages'

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

      // Connect to ChatHub endpoint (backend uses /chatHub based on negotiate endpoint)
      const hubUrl = `${config.public.assetsUrl}/chatHub`;
      console.log('🔌 Connecting to SignalR hub:', hubUrl);

      connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => token,
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents | signalR.HttpTransportType.LongPolling
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            // Exponential backoff: 0s, 2s, 10s, 30s, then 30s
            if (retryContext.previousRetryCount === 0) return 0;
            if (retryContext.previousRetryCount === 1) return 2000;
            if (retryContext.previousRetryCount === 2) return 10000;
            return 30000;
          }
        })
        .configureLogging(signalR.LogLevel.Information)
        .build()

      // Setup reconnection handlers
      connection.onreconnecting((error) => {
        console.warn('🔄 SignalR reconnecting...', error)
      })

      connection.onreconnected((connectionId) => {
        console.log('✅ SignalR reconnected:', connectionId)
      })

      connection.onclose((error) => {
        console.error('❌ SignalR connection closed:', error)
      })

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
        console.log('🔌 SignalR Disconnected')
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
      connection.on('ReceiveMessage', (message: any) => {
        // Normalize property names (backend sends PascalCase, frontend uses camelCase)
        const normalizedMessage: Message = {
          id: message.id || message.Id,
          fromUserId: message.fromUserId || message.FromUserId,
          fromUserName: message.fromUserName || message.FromUserName,
          toUserId: message.toUserId || message.ToUserId || null,
          toUserName: message.toUserName || message.ToUserName || null,
          content: message.content || message.Content,
          type: message.type !== undefined ? message.type : message.Type,
          attachmentUrl: message.attachmentUrl || message.AttachmentUrl || null,
          isRead: message.isRead !== undefined ? message.isRead : message.IsRead,
          readAt: message.readAt || message.ReadAt || null,
          sentAt: message.sentAt || message.SentAt,
          isAdminMessage: message.isAdminMessage !== undefined ? message.isAdminMessage : message.IsAdminMessage
        }
        console.log('📨 Message received:', normalizedMessage)
        callback(normalizedMessage)
      })
    }
  }

  /**
   * Listen for user online status
   */
  const onUserOnline = (callback: (data: UserConnection) => void): void => {
    if (connection) {
      connection.on('UserOnline', (data: any) => {
        const normalized: UserConnection = {
          userId: data.userId || data.UserId || data,
          role: data.role || data.Role || 'User',
          timestamp: data.timestamp || data.Timestamp || new Date().toISOString()
        }
        console.log('🟢 User online:', normalized)
        callback(normalized)
      })
    }
  }

  /**
   * Listen for user offline status
   */
  const onUserOffline = (callback: (data: { userId: string; timestamp: string }) => void): void => {
    if (connection) {
      connection.on('UserOffline', (data: any) => {
        const normalized = {
          userId: data.userId || data.UserId,
          timestamp: data.timestamp || data.Timestamp || new Date().toISOString()
        }
        console.log('🔴 User offline:', normalized)
        callback(normalized)
      })
    }
  }

  /**
   * Listen for typing indicator
   */
  const onTypingIndicator = (callback: (data: TypingIndicator) => void): void => {
    if (connection) {
      connection.on('TypingIndicator', (data: any) => {
        const normalized: TypingIndicator = {
          userId: data.userId || data.UserId,
          isTyping: data.isTyping !== undefined ? data.isTyping : data.IsTyping,
          timestamp: data.timestamp || data.Timestamp
        }
        console.log('⌨️ Typing indicator:', normalized)
        callback(normalized)
      })
    }
  }

  /**
   * Send typing indicator
   */
  const sendTypingIndicator = async (isTyping: boolean, toUserId: string | null = null): Promise<void> => {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
      try {
        await connection.invoke('SendTypingIndicator', isTyping, toUserId)
      } catch (error) {
        console.error('Error sending typing indicator:', error)
      }
    }
  }

  /**
   * Mark message as delivered
   */
  const markMessageDelivered = async (messageId: string): Promise<void> => {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
      try {
        await connection.invoke('MessageDelivered', messageId)
      } catch (error) {
        console.error('Error marking message as delivered:', error)
      }
    }
  }

  /**
   * Mark messages as read
   */
  const markMessagesRead = async (messageIds: string[]): Promise<void> => {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
      try {
        await connection.invoke('MessagesRead', messageIds)
      } catch (error) {
        console.error('Error marking messages as read:', error)
      }
    }
  }

  /**
   * Get online users count
   */
  const getOnlineUsersCount = async (): Promise<number> => {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
      try {
        return await connection.invoke<number>('GetOnlineUsersCount')
      } catch (error) {
        console.error('Error getting online users count:', error)
        return 0
      }
    }
    return 0
  }

  /**
   * Check if user is online
   */
  const isUserOnline = async (userId: string): Promise<boolean> => {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
      try {
        return await connection.invoke<boolean>('IsUserOnline', userId)
      } catch (error) {
        console.error('Error checking user online status:', error)
        return false
      }
    }
    return false
  }

  /**
   * Get all online users (admin only)
   */
  const getOnlineUsers = async (): Promise<UserConnection[]> => {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
      try {
        return await connection.invoke<UserConnection[]>('GetOnlineUsers')
      } catch (error) {
        console.error('Error getting online users:', error)
        return []
      }
    }
    return []
  }

  /**
   * Unsubscribe from all events
   */
  const offAll = (): void => {
    if (connection) {
      connection.off('ReceiveMessage')
      connection.off('UserOnline')
      connection.off('UserOffline')
      connection.off('TypingIndicator')
    }
  }

  /**
   * Get connection state
   */
  const getConnectionState = (): signalR.HubConnectionState | null => {
    return connection?.state || null
  }

  /**
   * Check if connected
   */
  const isConnected = (): boolean => {
    return connection?.state === signalR.HubConnectionState.Connected
  }

  return {
    // Connection management
    initializeConnection,
    stopConnection,
    isConnected,
    getConnectionState,

    // Event listeners
    onReceiveMessage,
    onUserOnline,
    onUserOffline,
    onTypingIndicator,
    offAll,

    // Actions
    sendTypingIndicator,
    markMessageDelivered,
    markMessagesRead,

    // User status (admin)
    getOnlineUsersCount,
    isUserOnline,
    getOnlineUsers
  }
}
