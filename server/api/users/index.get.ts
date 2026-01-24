/**
 * API endpoint to list all users
 * Protected by admin authentication
 */
export default eventHandler(async (event) => {
  // Only allow if user is already admin
  const { user } = await getUserSession(event)

  if (user?.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Admin access required' })
  }

  const db = useDrizzle()

  // Get all users
  const users = await db.select({
    id: tables.user.id,
    email: tables.user.email,
    nickname: tables.user.nickname,
    provider: tables.user.provider,
    role: tables.user.role,
    createdAt: tables.user.createdAt,
  }).from(tables.user).all()

  return users
})
