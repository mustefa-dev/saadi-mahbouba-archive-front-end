export default defineNuxtPlugin((nuxtApp) => {
  const userStore = useAppUserStore();

  // Configure global $fetch interceptor for all useFetch calls
  nuxtApp.hook('app:created', () => {
    const globalFetch = globalThis.$fetch;

    if (globalFetch) {
      // Wrap the global $fetch to add headers
      globalThis.$fetch = globalFetch.create({
        onRequest({ options }) {
          const token = userStore.getToken();

          // Add Authorization header if token exists
          if (token) {
            options.headers = {
              ...options.headers,
              'Authorization': `Bearer ${token}`,
              'Accept-Language': 'ar'
            };
          } else {
            options.headers = {
              ...options.headers,
              'Accept-Language': 'ar'
            };
          }
        },
        onResponseError({ response }) {
          // Handle 401 Unauthorized
          if (response.status === 401) {
            userStore.logout();
            navigateTo('/login');
          }
        }
      });
    }
  });
});
