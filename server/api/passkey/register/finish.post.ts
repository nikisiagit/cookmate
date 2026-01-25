// POST /api/passkey/register/finish - Verify registration and create user
import { verifyRegistrationResponse } from '@simplewebauthn/server'
import type { RegistrationResponseJSON } from '@simplewebauthn/types'

export default defineEventHandler(async (event) => {
    const body = await readBody<{
        nickname: string
        response: RegistrationResponseJSON
    }>(event)

    if (!body.nickname?.trim() || !body.response) {
        throw createError({
            statusCode: 400,
            message: 'Nickname and registration response are required',
        })
    }

    const nickname = body.nickname.trim()
    const db = useDB()
    const config = getWebAuthnConfig()

    // Get stored challenge
    const expectedChallenge = getChallenge(`register_${nickname}`)
    if (!expectedChallenge) {
        throw createError({
            statusCode: 400,
            message: 'Registration session expired. Please try again.',
        })
    }

    try {
        // Verify the registration response
        const verification = await verifyRegistrationResponse({
            response: body.response,
            expectedChallenge,
            expectedOrigin: config.origin,
            expectedRPID: config.rpID,
            requireUserVerification: true,
        })

        if (!verification.verified || !verification.registrationInfo) {
            throw createError({
                statusCode: 400,
                message: 'Registration verification failed',
            })
        }

        const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo

        // Create the user
        const newUsers = await db
            .insert(tables.user)
            .values({
                nickname,
                provider: 'passkey',
                role: 'user',
                createdAt: new Date(),
            })
            .returning()

        const user = newUsers[0]

        // Store the passkey credential
        await db.insert(tables.passkey).values({
            id: credential.id,
            userId: user.id,
            publicKey: Buffer.from(credential.publicKey),
            counter: credential.counter,
            deviceType: credentialDeviceType,
            backedUp: credentialBackedUp,
            transports: credential.transports ? JSON.stringify(credential.transports) : null,
            createdAt: new Date(),
        })

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
        console.error('Registration verification error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        throw createError({
            statusCode: 400,
            message: `Registration failed: ${errorMessage}`,
        })
    }
})
