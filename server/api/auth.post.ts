export default eventHandler(async (event) => {
  const body = await readBody(event) || {}
  const session = await getUserSession(event)
  const adminPassword = process.env.NUXT_ADMIN_PASSWORD || 'admin'
  const adminEmail = process.env.NUXT_ADMIN_EMAIL // Optional: specific admin email

  if (session.lastAttemptAt && Date.now() - session.lastAttemptAt < 5000)
    throw createError({ statusCode: 429, statusMessage: 'Too Many Requests' })

  if (body.password === adminPassword) {
    const db = useDB()

    // Check if admin user exists with password provider
    const existingAdmins = await db.select().from(tables.user).where(
      and(
        eq(tables.user.provider, 'password'),
        eq(tables.user.role, 'admin')
      )
    ).all()

    let adminUser = existingAdmins[0]

    // If no admin user exists, create one
    if (!adminUser) {
      // Get all existing nicknames to ensure uniqueness
      const allUsers = await db.select({ nickname: tables.user.nickname }).from(tables.user).all()
      const usedNicknames = allUsers.map(u => u.nickname)

      // Generate unique food-themed nickname
      const nickname = generateUniqueFoodNickname(usedNicknames)

      // Create new admin user
      const newUsers = await db.insert(tables.user).values({
        email: adminEmail || null,
        nickname,
        avatarUrl: null,
        provider: 'password',
        providerId: null,
        role: 'admin',
        createdAt: new Date(),
      }).returning()

      adminUser = newUsers[0]
    }

    // Set session with admin user info
    await setUserSession(event, {
      user: {
        id: adminUser.id,
        email: adminUser.email,
        nickname: adminUser.nickname,
        avatarUrl: adminUser.avatarUrl,
        role: 'admin',
      },
    })

    return { loggedIn: true }
  }

  await setUserSession(event, { lastAttemptAt: Date.now() })

  throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
})
