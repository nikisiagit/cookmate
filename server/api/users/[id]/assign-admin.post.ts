import { eq } from 'drizzle-orm'

/**
 * API endpoint to assign admin role to a specific user
 * Protected by admin authentication
 */
export default eventHandler(async (event) => {
  // Only allow if user is already admin
  const { user } = await getUserSession(event)

  if (user?.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Admin access required' })
  }

  const userId = getRouterParam(event, 'id')

  if (!userId) {
    throw createError({ statusCode: 400, statusMessage: 'User ID is required' })
  }

  const db = useDB()

  // Update user role to admin
  const updatedUsers = await db.update(tables.user)
    .set({ role: 'admin' })
    .where(eq(tables.user.id, parseInt(userId)))
    .returning()

  if (!updatedUsers || updatedUsers.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  return {
    success: true,
    user: {
      id: updatedUsers[0].id,
      email: updatedUsers[0].email,
      nickname: updatedUsers[0].nickname,
      role: updatedUsers[0].role,
    },
  }
})
