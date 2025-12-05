export interface User {
  id: string
  fullName: string
  phoneNumber: string
  role: string
  isVerified: boolean
  creationDate: string
  password?: string
  email?: string
  companyName?: string
  code?: string
  managerName?: string
  managerPhone?: string
  managerPhoneSecondary?: string
  lawyerName?: string
  lawyerPhone?: string
  lawyerPhoneSecondary?: string
  address?: string
  accountantName?: string
  accountantPhone?: string
  accountantPhoneSecondary?: string
  status?: UserStatus
  isActive?: boolean
}

export enum UserStatus {
  PendingApproval = 0,
  Active = 1,
  Rejected = 2,
}

export interface UsersResponse {
  data: User[]
  pageCount: number
  currentPage: number
  totalCount: number
}

export interface CreateUserRequest {
  companyName: string
  fullName: string
  phoneNumber: string
}

export interface UpdateUserRequest {
  fullName: string
  phoneNumber: string
}

export interface ApproveUserRequest {
  managerName: string
  managerPhone: string
  managerPhoneSecondary?: string
  lawyerName: string
  lawyerPhone: string
  lawyerPhoneSecondary?: string
  address: string
  accountantName: string
  accountantPhone: string
  accountantPhoneSecondary?: string
  email: string
  password: string
  code: string
}
