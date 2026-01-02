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
  name: string;
  filesCount: number;
  icon: string;
}

export interface ArchiveFile {
  id: string;
  fileName: string;
  fileType: string;
  categoryName: string;
  categoryPath: string; // Full path like "المستندات > العقود"
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
  year?: number;
  sortOrder?: 'asc' | 'desc';
  pageNumber?: number;
  pageSize?: number;
}

// Category tree structure for unlimited nesting
export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
  creationDate: string;
  parentId?: string;
  parentName?: string;
  level: number;
  childrenCount: number;
  reportsCount: number;
  totalReportsCount: number;
  children?: Category[];
}

export interface CategoryBreadcrumb {
  id: string;
  name: string;
  level: number;
}

export interface CategoryListItem {
  id: string;
  name: string;
  parentId?: string;
  level: number;
  fullPath: string;
}

export interface CategoryForm {
  name: string;
  description?: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
  parentId?: string;
}

export interface CategoryFilter {
  isActive?: boolean;
  searchTerm?: string;
  parentId?: string;
  rootOnly?: boolean;
  includeChildren?: boolean;
  maxDepth?: number;
  includeStatistics?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

// Search result types
export interface ArchiveSearchResult {
  files: SearchResultFile[];
  companies: SearchResultCompany[];
  totalFilesCount: number;
  totalCompaniesCount: number;
}

export interface SearchResultFile {
  id: string;
  fileName: string;
  fileType: string;
  categoryName?: string;
  categoryPath?: string;
  archivedAt?: string;
  fileUrl?: string;
  companyId: string;
  companyName: string;
  fileSource: 'client' | 'management';
}

export interface SearchResultCompany {
  userId: string;
  companyName: string;
  fullName?: string;
  code?: string;
  totalFilesCount: number;
}

export const FOLDER_CONFIG: Record<FolderType, { name: string; icon: string }> = {
  [FolderType.ClientFiles]: {
    name: 'ملفات العميل',
    icon: 'ph:user-circle-duotone'
  },
  [FolderType.ManagementFiles]: {
    name: 'ملفات الإدارة',
    icon: 'ph:buildings-duotone'
  },
  [FolderType.Conversations]: {
    name: 'المحادثات',
    icon: 'ph:chat-circle-text-duotone'
  },
  [FolderType.CompanyInfo]: {
    name: 'معلومات الشركة',
    icon: 'ph:info-duotone'
  }
};
