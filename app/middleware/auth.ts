export default defineNuxtRouteMiddleware(async (to, from) => {
  const { loggedIn, user } = useUserSession()

  // Check if user is logged in
  if (!loggedIn.value) {
    return navigateTo('/')
  }

  // Check if user has admin role
  if (user.value?.role !== 'admin') {
    return navigateTo('/')
  }
})
