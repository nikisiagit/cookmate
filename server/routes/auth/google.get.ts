import { eq } from 'drizzle-orm'

export default oauth.googleEventHandler({
  async onSuccess(event, { user: oauthUser }) {
    const db = useDrizzle()

    // Check if user already exists
    const existingUsers = await db.select().from(tables.user).where(
      eq(tables.user.providerId, oauthUser.sub)
    ).all()

    let user = existingUsers[0]

    if (!user) {
      // Get all existing nicknames to ensure uniqueness
      const allUsers = await db.select({ nickname: tables.user.nickname }).from(tables.user).all()
      const usedNicknames = allUsers.map(u => u.nickname)

      // Generate unique food-themed nickname
      const nickname = generateUniqueFoodNickname(usedNicknames)

      // Create new user
      const newUsers = await db.insert(tables.user).values({
        email: oauthUser.email,
        nickname,
        avatarUrl: oauthUser.picture,
        provider: 'google',
        providerId: oauthUser.sub,
        role: 'user',
        createdAt: new Date(),
      }).returning()

      user = newUsers[0]
    }

    await setUserSession(event, {
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
    })

    return sendRedirect(event, '/')
  },

  onError(event, error) {
    console.error('Google OAuth error:', error)
    return sendRedirect(event, '/?error=google_auth_failed')
  },
})
