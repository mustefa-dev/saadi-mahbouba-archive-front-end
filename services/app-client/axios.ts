import axios from 'axios'

export const baseURL = 'http://localhost:5051/'
const axiosIns = axios.create({
    baseURL: `${baseURL}api`,
})

// ℹ️ Add request interceptor to send the authorization header on each subsequent request after login
axiosIns.interceptors.request.use(config => {
    const token = useAppUserStore().user.token;
  if(!token)
    useRouter().push("/login")
    //const token = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiJkZDYwMmFjYy0wZDhiLTQxOTAtOTViNi0zZjUzOTc3OWYyZWQiLCJpZCI6ImRkNjAyYWNjLTBkOGItNDE5MC05NWI2LTNmNTM5Nzc5ZjJlZCIsInJvbGUiOiJBZG1pbiIsIlJvbGUiOiJBZG1pbiIsIlByb2plY3RJZCI6IiIsIm5iZiI6MTcyMjYwNjc3OCwiZXhwIjoxNzI1MTk4Nzc4LCJpYXQiOjE3MjI2MDY3Nzh9.xyV-WhBF_EhlHQdX09emoxSki2OWvG9d1G-XhQZqSiGyY_F0hcErNMCFqEouhXXB6zBF0CoJYxAOxcvlX-mcAQ"
    //const token = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiJmMzU2NzdiZi1iMmY1LTRiMWEtYThmYy1jMzY0MWQ3OWVjNWIiLCJpZCI6ImYzNTY3N2JmLWIyZjUtNGIxYS1hOGZjLWMzNjQxZDc5ZWM1YiIsInJvbGUiOiJVc2VyIiwiUm9sZSI6IlVzZXIiLCJQcm9qZWN0SWQiOiI0ZjQ1YzllMy0xMWJjLTQyNTktOGI3Ni1kNWNlNGVkZGExNzYiLCJuYmYiOjE3MjI2MDY5NjMsImV4cCI6MTcyNTE5ODk2MywiaWF0IjoxNzIyNjA2OTYzfQ.H5KBADOOIl6vKTFnNIeNzweYjtH68z-vZwUZ-jGcPSuCejSaNtY3US5Iog9C3ijAR52HjUx31WAgN2F8vzt0ug"

    config.headers = config.headers || {}
    config.headers['Accept-Language'] = 'ar'
    config.headers.Authorization = token ? `Bearer ${token}` : ''

    return config
})

// ℹ️ Add response interceptor to handle 401 response
axiosIns.interceptors.response.use(response => {
    return response
}, error => {
    console.error(error)
    // Handle error
    if (!error.response || error.response.status === 401) {
        console.error('error is 401')
        useAppUserStore().user = {};
        // Remove "userData" from localStorage
        localStorage.removeItem('userData')
        localStorage.removeItem('user')

        // Remove "accessToken" from localStorage
        localStorage.removeItem('accessToken')
        localStorage.removeItem('userAbilities')
        useRouter().push('/login')
    }
    throw error;
})

export default axiosIns
