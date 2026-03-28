/**
 * Helper Functions Composable
 * Provides user feedback utilities and error handling
 */

/**
 * Sanitize error messages to hide technical details from users.
 * Strips endpoint paths, stack traces, and raw technical info.
 */
const sanitizeErrorMessage = (message: string, fallback: string): string => {
  if (!message || typeof message !== 'string') return fallback

  // If the message contains URL paths, endpoint paths, or technical patterns, use fallback
  const technicalPatterns = [
    /\/api\//i,
    /https?:\/\//i,
    /localhost/i,
    /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/,  // IP addresses
    /Exception/,
    /Stack\s?Trace/i,
    /at\s+\w+\.\w+\(/,                        // stack trace lines
    /NullReferenceException/,
    /Internal Server Error/i,
    /500|502|503|504/,
    /SqlException/i,
    /LINQ/,
    /EntityFramework/i,
    /Npgsql/i,
    /System\.\w+/,
    /Microsoft\.\w+/,
  ]

  for (const pattern of technicalPatterns) {
    if (pattern.test(message)) {
      return fallback
    }
  }

  return message
}

export const useHelpers = () => {
  /**
   * Display success message toast
   */
  const setSuccessMessage = (locale: string, enMsg: string, arMsg: string) => {
    const message = locale === 'en' ? enMsg : arMsg
    useToast({
      title: 'نجح',
      message: message,
      icon: 'ph:check-circle',
      isError: false
    })
  }

  /**
   * Extract raw error message from API response (unsanitized, for programmatic use)
   */
  const extractErrorMessage = (error: any): string | null => {
    if (error?.response?.data) {
      const data = error.response.data
      if (data.message) return data.message
      if (data.Message) return data.Message
      if (data.error) return data.error
      if (data.Error) return data.Error
      if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) return data.errors[0]
      if (data.Errors && Array.isArray(data.Errors) && data.Errors.length > 0) return data.Errors[0]
      if (typeof data === 'string') return data
    }
    // Also handle $fetch error shape (error.data instead of error.response.data)
    if (error?.data) {
      const data = error.data
      if (data.message) return data.message
      if (data.Message) return data.Message
      if (data.error) return data.error
      if (data.Error) return data.Error
      if (typeof data === 'string') return data
    }
    return null
  }

  /**
   * Display error message toast with automatic sanitization
   */
  const setErrorMessage = (error: any, locale: string, defaultEnMsg: string, defaultArMsg: string) => {
    const fallback = locale === 'en' ? defaultEnMsg : defaultArMsg
    const rawMessage = extractErrorMessage(error)
    const errorMessage = rawMessage
      ? sanitizeErrorMessage(rawMessage, fallback)
      : fallback

    useToast({
      title: 'خطأ',
      message: errorMessage,
      icon: 'ph:x-circle',
      isError: true
    })
  }

  /**
   * Display info/loading message toast
   */
  const setLoadingMessage = (locale: string, enMsg: string, arMsg: string) => {
    const message = locale === 'en' ? enMsg : arMsg
    useToast({
      title: 'معلومات',
      message: message,
      icon: 'ph:info',
      isError: false
    })
  }

  return {
    setSuccessMessage,
    setErrorMessage,
    setLoadingMessage,
    extractErrorMessage,
    sanitizeErrorMessage
  }
}
