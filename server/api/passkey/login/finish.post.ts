// POST /api/passkey/login/finish - Verify authentication and log in user
import { verifyAuthenticationResponse } from '@simplewebauthn/server'
import type { AuthenticationResponseJSON } from '@simplewebauthn/types'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    const body = await readBody<{
        sessionKey: string
        response: AuthenticationResponseJSON
    }>(event)

    if (!body.sessionKey || !body.response) {
        throw createError({
            statusCode: 400,
            message: 'Session key and authentication response are required',
        })
    }

    const db = useDB()
    const config = getWebAuthnConfig()

    // Get stored challenge
    const expectedChallenge = getChallenge(body.sessionKey)
    if (!expectedChallenge) {
        throw createError({
            statusCode: 400,
            message: 'Login session expired. Please try again.',
        })
    }

    // Find the passkey by credential ID
    const credentialId = body.response.id
    const passkeys = await db
        .select()
        .from(tables.passkey)
        .where(eq(tables.passkey.id, credentialId))
        .all()

    if (passkeys.length === 0) {
        throw createError({
            statusCode: 404,
            message: 'Passkey not found. Please register first.',
        })
    }

    const passkey = passkeys[0]

    // Get the user
    const users = await db
        .select()
        .from(tables.user)
        .where(eq(tables.user.id, passkey.userId))
        .all()

    if (users.length === 0) {
        throw createError({
            statusCode: 404,
            message: 'User not found.',
        })
    }

    const user = users[0]

    try {
        // Verify the authentication response
        const verification = await verifyAuthenticationResponse({
            response: body.response,
            expectedChallenge,
            expectedOrigin: config.origin,
            expectedRPID: config.rpID,
            credential: {
                id: passkey.id,
                publicKey: new Uint8Array(passkey.publicKey),
                counter: passkey.counter,
                transports: parseTransports(passkey.transports),
            },
            requireUserVerification: true,
        })

        if (!verification.verified) {
            throw createError({
                statusCode: 400,
                message: 'Authentication verification failed',
            })
        }

        // Update the counter to prevent replay attacks
        await db
            .update(tables.passkey)
            .set({ counter: verification.authenticationInfo.newCounter })
            .where(eq(tables.passkey.id, passkey.id))

        // Set user session
        await setUserSession(event, {
            user: {
                id: user.id,
                email: user.email,
                nickname: user.nickname,
                avatarUrl: user.avatarUrl,
                role: user.role,
            },
        })

        return {
            success: true,
            user: {
                id: user.id,
                nickname: user.nickname,
                role: user.role,
            },
        }
    }
    catch (error: unknown) {
        console.error('Authentication verification error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        throw createError({
            statusCode: 400,
            message: `Login failed: ${errorMessage}`,
        })
    }
})
