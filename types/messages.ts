/**
 * Message Type Definitions
 */

export enum MessageType {
  TEXT = 0,
  IMAGE = 1,
  FILE = 2,
  VOICE = 3
}

export interface Message {
  id: string
  content: string
  type: MessageType
  attachmentUrl?: string
  sentAt: string
  isAdminMessage: boolean
  isRead: boolean
  fromUserId: string
  toUserId: string
}

export interface Conversation {
  userId: string
  userName: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

export interface ConversationsResponse {
  data: Conversation[]
  pageNumber: number
  pageSize: number
}

export interface MessagesResponse {
  data: Message[]
  pageCount: number
  currentPage: number
  totalCount: number
}

export interface SendMessageRequest {
  content: string
  type: MessageType
  attachmentUrl?: string | null
  toUserId: string
}
