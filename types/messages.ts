// types/messages.ts

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
  fromUserName?: string
  toUserName?: string
}

export interface MessagesResponse {
  data: Message[]
  pageNumber: number
  pageSize: number
  pageCount: number
  totalCount: number
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
  pageCount: number
  totalCount: number
}

export interface FilePreview {
  file: File
  type: 'image' | 'file' | 'voice'
  previewUrl?: string
}

