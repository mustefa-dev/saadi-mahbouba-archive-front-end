/**
 * Utility Helper Functions
 * Date and phone number formatting
 */

/**
 * Format date as DD/MM/YYYY
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Format date and time as DD/MM/YYYY - HH:MM AM/PM
 */
export const formatDateAndTime = (dateString: string): string => {
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  let hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12

  return `${day}/${month}/${year} - ${hours}:${minutes} ${ampm}`
}

/**
 * Convert date to UTC ISO string
 */
export const formatDateToUtc = (date: Date): string => {
  return date.toISOString()
}

/**
 * Convert international phone format (+964) to local (0)
 */
export const phoneNumberFormatter = (phoneNumber: string): string => {
  if (phoneNumber.startsWith('+964')) {
    return phoneNumber.replace('+964', '0')
  }
  return phoneNumber
}

/**
 * Convert local phone format (0) to international (+964)
 */
export const phoneNumberOTP = (phoneNumber: string): string => {
  if (phoneNumber.startsWith('0')) {
    return phoneNumber.replace('0', '+964')
  }
  return phoneNumber
}

/**
 * Format time ago (e.g., "5 minutes ago", "2 hours ago")
 */
export const timeAgo = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'الآن'
  if (seconds < 3600) return `منذ ${Math.floor(seconds / 60)} دقيقة`
  if (seconds < 86400) return `منذ ${Math.floor(seconds / 3600)} ساعة`
  if (seconds < 604800) return `منذ ${Math.floor(seconds / 86400)} يوم`
  if (seconds < 2592000) return `منذ ${Math.floor(seconds / 604800)} أسبوع`
  if (seconds < 31536000) return `منذ ${Math.floor(seconds / 2592000)} شهر`
  return `منذ ${Math.floor(seconds / 31536000)} سنة`
}
