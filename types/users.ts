/**
 * User Type Definitions
 */

export interface User {
  id: string
  fullName: string
  phoneNumber: string
  role: string
  isVerified: boolean
  creationDate: string
  password?: string
}

export interface UsersResponse {
  data: User[]
  pageCount: number
  currentPage: number
  totalCount: number
}

export interface CreateUserRequest {
  fullName: string
  phoneNumber: string
  password: string
}

export interface UpdateUserRequest {
  fullName: string
  phoneNumber: string
}
