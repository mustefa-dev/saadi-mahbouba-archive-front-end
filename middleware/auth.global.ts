export default defineNuxtRouteMiddleware((to, from) => {
  if(from.path.includes('login') || to.path.includes('login'))
    return;
  const user = localStorage.getItem('user')
  if(!user)
    return navigateTo('/login')
})
