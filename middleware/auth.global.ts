export default defineNuxtRouteMiddleware((to, from) => {
  // Skip middleware on server-side
  if (process.server) return;

  const publicRoutes = ['/login', '/OTP'];
  const isPublicRoute = publicRoutes.some(route => to.path === route);

  // Get token directly from localStorage (synchronous, no async issues)
  const token = process.client ? localStorage.getItem('authToken') : null;

  console.log('🔒 Auth Middleware:', {
    to: to.path,
    from: from?.path,
    hasToken: !!token,
    isPublicRoute,
    tokenPreview: token ? token.substring(0, 30) + '...' : 'NO TOKEN'
  });

  // If going to public route and already has token, redirect to home
  if (isPublicRoute && token) {
    console.log('✅ Already logged in - redirecting to home');
    return navigateTo('/');
  }

  // Allow access to public routes
  if (isPublicRoute) {
    console.log('✅ Public route - allowing access');
    return;
  }

  // Redirect to login if no token
  if (!token) {
    console.log('❌ No token - redirecting to login');
    return navigateTo('/login');
  }

  console.log('✅ Auth check passed - allowing access');
})
