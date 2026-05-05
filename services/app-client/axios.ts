import axios from 'axios'

// Hardcode base URL - runtime config can't be used at module level
export const baseURL = 'https://api-saadi-mahbouba.sumercode.com'
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
    }

    return config
})

// ℹ️ Add response interceptor to handle 401 response
axiosIns.interceptors.response.use(response => {
    return response
}, error => {
    // ONLY redirect on 401 Unauthorized - not on network errors or other status codes
    if (error.response && error.response.status === 401) {
        // Clear localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');

        // Redirect to login
        if (process.client) {
            window.location.href = '/login';
        }
    }

    throw error;
})

export default axiosIns
