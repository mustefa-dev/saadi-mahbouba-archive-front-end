export default defineNuxtRouteMiddleware((to, from) => {
  // Skip middleware on server-side
  if (process.server) return;

  const publicRoutes = ['/login', '/OTP'];
  const isPublicRoute = publicRoutes.some(route => to.path === route);

  // Get token directly from localStorage (synchronous, no async issues)
  const token = process.client ? localStorage.getItem('authToken') : null;

  // If going to public route and already has token, redirect to home
  if (isPublicRoute && token) {
    return navigateTo('/');
  }

  // Allow access to public routes
  if (isPublicRoute) {
    return;
  }

  // Redirect to login if no token
  if (!token) {
    return navigateTo('/login');
  }
})
