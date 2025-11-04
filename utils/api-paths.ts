/**
 * API Endpoints Configuration
 * Centralized API endpoint definitions
 */

export const useApiPaths = () => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.baseUrl || 'https://almawsua-dashboard.taco5k.site/api'
  const assetsUrl = config.public.assetsUrl || 'https://almawsua-dashboard.taco5k.site'

  return {
    // Authentication
    login: `${baseUrl}/login`,
    sendOTP: `${baseUrl}/send-otp`,
    verifyOTP: `${baseUrl}/verify-otp`,

    // Users
    users: `${baseUrl}/users`,
    userById: (id: string) => `${baseUrl}/users/${id}`,
    approveUser: (id: string) => `${baseUrl}/users/${id}/approve`,

    // Admins
    admins: `${baseUrl}/admins`,

    // Messages
    conversations: `${baseUrl}/message/conversations`,
    conversationById: (userId: string) => `${baseUrl}/message/conversation/${userId}`,
    sendMessage: `${baseUrl}/message/send`,
    sendMessageWithAttachment: `${baseUrl}/message/send-with-attachment`,
    markMessageRead: `${baseUrl}/message/mark-read`,
    markMessageDelivered: (messageId: string) => `${baseUrl}/message/mark-delivered/${messageId}`,

    // Files
    uploadFile: `${baseUrl}/file/upload`,
    uploadMultipleFiles: `${baseUrl}/file/upload-multiple`,
    uploadMulti: `${baseUrl}/file/multi`,
    userFiles: (userId: string) => `${baseUrl}/file/user/${userId}`,
    myFiles: `${baseUrl}/file/my-files`,

    // Assets
    getAsset: (path: string) => {
      // If path is already a full URL, return as is
      if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
      }
      // Add leading slash if missing
      const normalizedPath = path.startsWith('/') ? path : `/${path}`;
      return `${assetsUrl}${normalizedPath}`;
    }
  }
}
