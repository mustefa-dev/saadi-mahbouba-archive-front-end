import axios from 'axios'

// Hardcode base URL - runtime config can't be used at module level
export const baseURL = 'https://almawsua-dashboard.taco5k.site'
const axiosIns = axios.create({
    baseURL: `${baseURL}/api`,
})

// ℹ️ Add request interceptor to send the authorization header on each subsequent request after login
axiosIns.interceptors.request.use(config => {
    // Get token from localStorage (simplified)
    const token = localStorage.getItem('authToken');

    config.headers = config.headers || {}
    config.headers['Accept-Language'] = 'ar'

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
        console.log('Adding token to request:', token.substring(0, 20) + '...');
    } else {
        console.warn('No token found in localStorage');
    }

    return config
})

// ℹ️ Add response interceptor to handle 401 response
axiosIns.interceptors.response.use(response => {
    console.log('✅ API Response OK:', response.config.url);
    return response
}, error => {
    console.error('❌ API Response Error:', {
        url: error.config?.url,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        hasResponse: !!error.response
    });

    // ONLY redirect on 401 Unauthorized - not on network errors or other status codes
    if (error.response && error.response.status === 401) {
        console.error('🚫 Unauthorized (401) - Clearing auth and redirecting to login')

        // Clear localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');

        // Redirect to login
        if (process.client) {
            window.location.href = '/login';
        }
    } else if (!error.response) {
        console.error('🌐 Network error - no response from server (possibly CORS, timeout, or server down)');
    }

    throw error;
})

export default axiosIns
