/**
 * Authentication Type Definitions
 */

export interface LoginRequest {
  phoneNumber: string
  password: string
}

export interface OTPRequest {
  phoneNumber: string
  code: string
}

export interface LoginResponse {
  id: string
  fullName: string
  email?: string
  role: string
  isVerified: boolean
  token: string
  governmentId?: string | null
  creationDate: string
}

export interface OTPResponse {
  token: string
  user: {
    id: string
    fullName: string
    phoneNumber: string
    role: string
  }
}
