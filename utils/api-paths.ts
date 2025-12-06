/**
 * API Endpoints Configuration
 * Centralized API endpoint definitions
 */

export const useApiPaths = () => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.baseUrl || 'https://archive-api.taco5k.site/api'
  const assetsUrl = config.public.assetsUrl || 'https://archive-api.taco5k.site'

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
    messageHistory: `${baseUrl}/message/history`,
    conversations: `${baseUrl}/message/conversations`,
    conversationById: (userId: string) => `${baseUrl}/message/conversation/${userId}`,
    sendMessage: `${baseUrl}/message/send`,
    sendMessageWithAttachment: `${baseUrl}/message/send-with-attachment`,
    markMessageRead: `${baseUrl}/message/mark-read`,
    markMessageDelivered: (messageId: string) => `${baseUrl}/message/mark-delivered/${messageId}`,
    unreadCount: `${baseUrl}/message/unread-count`,
    messageById: (messageId: string) => `${baseUrl}/message/${messageId}`,
    deleteMessage: (messageId: string) => `${baseUrl}/message/${messageId}`,

    // Files
    uploadFile: `${baseUrl}/file/upload`,
    uploadMultipleFiles: `${baseUrl}/file/upload-multiple`,
    uploadMulti: `${baseUrl}/file/multi`,
    userFiles: (userId: string) => `${baseUrl}/file/user/${userId}`,
    myFiles: `${baseUrl}/file/my-files`,

    // Reports
    reports: `${baseUrl}/reports`,
    allReports: `${baseUrl}/reports/all`,
    reportsGrouped: `${baseUrl}/reports/grouped`,
    reportById: (id: string) => `${baseUrl}/reports/${id}`,
    reportStatistics: `${baseUrl}/reports/statistics`,
    reportsByUserId: (userId: string) => `${baseUrl}/reports/user/${userId}`,
    reportsByUserAndCategory: (userId: string, categoryId: string) => `${baseUrl}/reports/user/${userId}/category/${categoryId}`,
    reviewReport: (id: string) => `${baseUrl}/reports/${id}/review`,
    changeReportStatus: (id: string) => `${baseUrl}/reports/${id}/status`,
    archiveReport: (id: string) => `${baseUrl}/reports/${id}/archive`,
    assignReportCategory: (reportId: string) => `${baseUrl}/Reports/${reportId}/assign-category`,
    myReportFiles: `${baseUrl}/reports/files/my`,
    reportFilesByType: (fileType: string) => `${baseUrl}/reports/files/my/type/${fileType}`,

    // Categories
    categories: `${baseUrl}/Categories`,
    categoryById: (id: string) => `${baseUrl}/Categories/${id}`,
    subCategories: `${baseUrl}/SubCategories`,
    subCategoryById: (id: string) => `${baseUrl}/SubCategories/${id}`,
    archive: `${baseUrl}/Archive`,

    // Banners
    banners: `${baseUrl}/Banners`,
    bannerById: (id: string) => `${baseUrl}/Banners/${id}`,
    activeBanners: `${baseUrl}/Banners/active`,
    trackBanner: `${baseUrl}/Banners/track`,

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
