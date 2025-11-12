// filepath: c:\Users\lenovo\WebstormProjects\saadi-mahbouba-archive-front-end\types\messages.d.ts

export interface Message {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string | null;
  toUserName: string | null;
  content: string;
  type: MessageType;
  attachmentUrl: string | null;
  isRead: boolean;
  readAt: string | null;
  sentAt: string;
  isAdminMessage: boolean;
}

export enum MessageType {
  Text = 0,
  Image = 1,
  File = 2,
  Voice = 3,
  Report = 4,
}

export interface Conversation {
  userId: string;
  userName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface MessageHistoryResponse {
  message: string;
  data: Message[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface ConversationsResponse {
  message: string;
  data: Conversation[];
  pageNumber: number;
  pageSize: number;
}

export interface SendMessageRequest {
  content: string;
  type: MessageType;
  attachmentUrl?: string | null;
  toUserId?: string | null;
}

export interface SendMessageWithAttachmentForm {
  content?: string;
  type: MessageType;
  attachment?: File;
  toUserId?: string | null;
  reportTitle?: string;
  reportDescription?: string;
  reportCategoryId?: string;
  reportSubCategoryId?: string;
}

export interface TypingIndicator {
  userId: string;
  isTyping: boolean;
  timestamp?: string;
}

export interface UserConnection {
  userId: string;
  role: string;
  timestamp: string;
}

export interface ApiResponse<T = any> {
  message: string;
  data: T;
  errors?: any;
}

export interface MessageResponse {
  message: string;
  data: Message;
}

export interface UnreadCountResponse {
  message: string;
  data: number;
}

export interface DeleteMessageResponse {
  message: string;
  data: boolean;
}

