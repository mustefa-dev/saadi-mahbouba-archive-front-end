export interface CompanyArchive {
  userId: string;
  companyName: string;
  fullName: string;
  code: string;
  subCategoriesCount: number;
  clientFilesCount: number;
  managementFilesCount: number;
  conversationsCount: number;
  createdAt: string;
}

export enum FolderType {
  ClientFiles = 'client-files',
  ManagementFiles = 'management-files',
  Conversations = 'conversations',
  CompanyInfo = 'company-info'
}

export interface ArchiveFolder {
  id: FolderType;
  nameAr: string;
  filesCount: number;
  icon: string;
}

export interface ArchiveFile {
  id: string;
  fileName: string;
  fileType: string;
  categoryName: string;
  subCategoryName: string;
  archivedAt: string;
  senderName: string;
  fileUrl: string;
}

export interface CompanyFolders {
  clientFilesCount: number;
  managementFilesCount: number;
  conversationsCount: number;
}

export interface CompanyDetails {
  managerName: string;
  email: string;
  phoneNumber: string;
  address: string;
  lawyerName: string;
  accountantName: string;
  registrationDate: string;
}

export interface ConversationMessage {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId?: string;
  content: string;
  type: number;
  attachmentUrl?: string;
  isAdminMessage: boolean;
  sentAt: string;
}

export interface ArchiveFileFilter {
  search?: string;
  categoryId?: string;
  subCategoryId?: string;
  year?: number;
  sortOrder?: 'asc' | 'desc';
  pageNumber?: number;
  pageSize?: number;
}

export const FOLDER_CONFIG: Record<FolderType, { nameAr: string; icon: string }> = {
  [FolderType.ClientFiles]: {
    nameAr: 'ملفات العميل',
    icon: 'ph:user-circle-duotone'
  },
  [FolderType.ManagementFiles]: {
    nameAr: 'ملفات الإدارة',
    icon: 'ph:buildings-duotone'
  },
  [FolderType.Conversations]: {
    nameAr: 'المحادثات',
    icon: 'ph:chat-circle-text-duotone'
  },
  [FolderType.CompanyInfo]: {
    nameAr: 'معلومات الشركة',
    icon: 'ph:info-duotone'
  }
};
