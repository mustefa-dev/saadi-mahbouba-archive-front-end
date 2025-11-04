/**
 * Helper Functions Composable
 * Provides user feedback utilities and error handling
 */

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
   * Display error message toast with automatic translation
   */
  const setErrorMessage = (error: any, locale: string, defaultEnMsg: string, defaultArMsg: string) => {
    let errorMessage = locale === 'en' ? defaultEnMsg : defaultArMsg

    // Try to extract error from response
    if (error?.response?.data) {
      const data = error.response.data

      // Check for error message in various formats
      if (data.message) {
        errorMessage = data.message
      } else if (data.error) {
        errorMessage = data.error
      } else if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        errorMessage = data.errors[0]
      } else if (typeof data === 'string') {
        errorMessage = data
      }
    } else if (error?.message) {
      errorMessage = error.message
    }

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
    setLoadingMessage
  }
}
