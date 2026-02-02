// POST /api/passkey/login/start - Generate authentication options
import { generateAuthenticationOptions } from '@simplewebauthn/server'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    const body = await readBody<{ nickname?: string }>(event)
    const db = useDB()
    const config = getWebAuthnConfig()

    let allowCredentials: { id: string; transports: string | null }[] = []
    let sessionKey = 'login_anonymous'

    // If nickname is provided, get their specific credentials
    if (body.nickname?.trim()) {
        const nickname = body.nickname.trim()
        sessionKey = `login_${nickname}`

        // Find user by nickname
        const users = await db
            .select()
            .from(tables.user)
            .where(eq(tables.user.nickname, nickname))
            .all()

        if (users.length === 0) {
            throw createError({
                statusCode: 404,
                message: 'User not found. Please check your nickname or register first.',
            })
        }

        const user = users[0]

        // Get user's passkeys
        const passkeys = await db
            .select()
            .from(tables.passkey)
            .where(eq(tables.passkey.userId, user.id))
            .all()

        if (passkeys.length === 0) {
            throw createError({
                statusCode: 400,
                message: 'No passkeys registered for this user.',
            })
        }

        allowCredentials = passkeys.map((pk) => ({
            id: pk.id,
            transports: pk.transports,
        }))
    }

    const options = await generateAuthenticationOptions({
        rpID: config.rpID,
        userVerification: 'required',
        // If we have specific credentials, use them; otherwise allow any discoverable credential
        allowCredentials: allowCredentials.length > 0
            ? allowCredentials.map((cred) => ({
                id: cred.id,
                transports: parseTransports(cred.transports),
            }))
            : undefined,
    })

    // Store challenge
    storeChallenge(sessionKey, options.challenge)

    return {
        options,
        sessionKey,
    }
})
