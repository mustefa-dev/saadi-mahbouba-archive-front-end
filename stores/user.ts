import axios from "~/services/app-client/axios.js"
import type { Project } from "~/views/projects/types";
import type { LoginResponse } from "~/types/auth";

interface AppUser{
  id?:string;
  fullName?:string;
  token?:string;
  project?:Project;
  role?:string;
  phoneNumber?:string;
  isVerified?:boolean;
}

export const useAppUserStore = defineStore('appUserStore',()=>{
  const user = ref<AppUser>({});
  const isError = ref<boolean>(false);
  const isChangePasswordDialogOpen = ref<boolean>(false);

  // Initialize user from localStorage on store creation
  const initAuth = () => {
    if (process.client) {
      try {
        const storedToken = localStorage.getItem('authToken');
        const storedUserStr = localStorage.getItem('authUser');

        console.log('🔄 InitAuth - Token found:', !!storedToken);
        console.log('🔄 InitAuth - User found:', !!storedUserStr);

        if (storedToken && storedUserStr) {
          user.value = JSON.parse(storedUserStr);
          console.log('✅ User loaded:', user.value.fullName);
        } else {
          console.log('❌ No user data in localStorage');
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
      }
    }
  };

  // Auto-initialize on store creation
  initAuth();

  const login = async (phoneNumber: string, password: string) => {
    const apiPaths = useApiPaths();
    const res = await axios.post(apiPaths.login, { phoneNumber, password });
    return res.data;
  };

  // Request OTP code
  const sendOTP = async (phoneNumber: string) => {
    const apiPaths = useApiPaths();
    const res = await axios.post(apiPaths.sendOTP, { phoneNumber });
    return res.data;
  };

  // Verify OTP and complete authentication
  const verifyOTP = async (phoneNumber: string, code: string) => {
    const apiPaths = useApiPaths();
    const res = await axios.post(apiPaths.verifyOTP, { phoneNumber, code });

    if (res.data && res.data.token) {
      const userData: AppUser = {
        id: res.data.user?.id || res.data.id,
        fullName: res.data.user?.fullName || res.data.fullName,
        token: res.data.token,
        role: res.data.user?.role || res.data.role,
        phoneNumber: res.data.user?.phoneNumber || phoneNumber,
        isVerified: true
      };

      // Store in localStorage
      localStorage.setItem('authToken', res.data.token);
      localStorage.setItem('authUser', JSON.stringify(userData));

      user.value = userData;
    }

    return res.data;
  };

  // Get current token (synchronous)
  const getToken = (): string | null => {
    if (user.value && user.value.token) {
      return user.value.token;
    }
    if (process.client) {
      return localStorage.getItem('authToken');
    }
    return null;
  };

  // Check if user is in specific role(s)
  const isInRole = (role : string | string[])=>{
    if(!user.value.role)
      return false;
    if(Array.isArray(role))
      return role.findIndex(r=>r===user.value.role)!=-1;
    return user.value.role === role;
  };

  // Logout and clear auth
  const logout = () => {
    console.log('🔓 Logging out...');
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    user.value = {};
    if (process.client) {
      window.location.href = '/login';
    }
  };

  return {
    user,
    isChangePasswordDialogOpen,
    login,
    sendOTP,
    verifyOTP,
    getToken,
    isError,
    logout,
    isInRole
  }
});
