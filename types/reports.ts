/**
 * Report Types
 * Matches backend DTOs for Reports and Categories
 */

// Report Status Enum
export enum ReportStatus {
  Pending = 0,
  UnderReview = 1,
  Approved = 2,
  Rejected = 3
}

export const ReportStatusLabels: Record<ReportStatus, string> = {
  [ReportStatus.Pending]: 'قيد الانتظار',
  [ReportStatus.UnderReview]: 'قيد المراجعة',
  [ReportStatus.Approved]: 'مقبول',
  [ReportStatus.Rejected]: 'مرفوض'
};

export const ReportStatusColors: Record<ReportStatus, 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
  [ReportStatus.Pending]: 'warning',
  [ReportStatus.UnderReview]: 'info',
  [ReportStatus.Approved]: 'success',
  [ReportStatus.Rejected]: 'danger'
};

// Helper functions for safe status access
export function getReportStatusColor(status: ReportStatus): 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  return ReportStatusColors[status] || 'default';
}

export function getReportStatusLabel(status: ReportStatus): string {
  return ReportStatusLabels[status] || status.toString();
}

// Category Type (tree structure with unlimited depth)
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

// Report Type
export interface Report {
  id: string;
  title: string;
  description: string;
  categoryId?: string;
  categoryName?: string;
  categoryPath?: string;
  status: ReportStatus;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  createdAt: string;
  updatedAt?: string;
  userId: string;
  reviewerNote?: string;
  // User/Company info
  companyName?: string;
  userFullName?: string;
  userCode?: string;
  // Archive-specific fields
  fileYear?: number;
  archiveFileName?: string;
  archiveNotes?: string;
  archivedAt?: string;
}

// Form Types
export interface ReportForm {
  title: string;
  description: string;
  categoryId?: string;
  file: File | null;
}

export interface ReportUpdate {
  title?: string;
  description?: string;
  categoryId?: string;
}

export interface ReportReview {
  status: ReportStatus;
  reviewerNote?: string;
}

export interface CategoryForm {
  name: string;
  description?: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
  parentId?: string;
}

export interface CategoryUpdate {
  name?: string;
  description?: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface AssignCategoryForm {
  categoryId?: string;
}

// Filter Types
export interface ReportFilter {
  categoryId?: string;
  status?: ReportStatus;
  search?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface CategoryFilter {
  isActive?: boolean;
  search?: string;
  parentId?: string;
  rootOnly?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

// Response Types
export interface ReportsResponse {
  data: Report[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  isLast: boolean;
}

export interface CategoriesResponse {
  data: Category[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  isLast: boolean;
}

// Statistics Type
export interface ReportStatistics {
  totalReports: number;
  pendingReports: number;
  underReviewReports: number;
  approvedReports: number;
  rejectedReports: number;
  reportsToday: number;
}

// Grouped Reports by Company
export interface ReportsGroupedByCompany {
  userId: string;
  companyName: string;
  fullName: string;
  code?: string;
  totalReports: number;
  pendingCount: number;
  underReviewCount: number;
  archivedCount: number;
  rejectedCount: number;
  reports: Report[];
}

// Archive Form
export interface ArchiveReportForm {
  fileYear: number;
  archiveFileName: string;
  categoryId: string;
  archiveNotes?: string;
  archiveType?: 'client' | 'management'; // Optional - defaults to 'client' on backend
  isVisibleToClient: boolean; // Controls if client can see this archived file
}

// Change Status Form
export interface ChangeStatusForm {
  status: ReportStatus;
}
