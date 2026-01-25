// POST /api/passkey/register/start - Generate registration options
import { generateRegistrationOptions } from '@simplewebauthn/server'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    const body = await readBody<{ nickname: string }>(event)

    if (!body.nickname?.trim()) {
        throw createError({
            statusCode: 400,
            message: 'Nickname is required',
        })
    }

    const nickname = body.nickname.trim()
    const db = useDB()
    const config = getWebAuthnConfig()

    // Check if nickname already exists
    const existingUsers = await db
        .select()
        .from(tables.user)
        .where(eq(tables.user.nickname, nickname))
        .all()

    if (existingUsers.length > 0) {
        throw createError({
            statusCode: 409,
            message: 'This nickname is already taken',
        })
    }

    // Generate a temporary user ID for registration
    const tempUserId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Get existing passkeys for this user (none for new registration)
    const existingPasskeys: { id: string; transports: string | null }[] = []

    const options = await generateRegistrationOptions({
        rpName: config.rpName,
        rpID: config.rpID,
        userName: nickname,
        userDisplayName: nickname,
        // Don't require attestation for better compatibility
        attestationType: 'none',
        // Exclude existing credentials
        excludeCredentials: existingPasskeys.map((pk) => ({
            id: pk.id,
            transports: parseTransports(pk.transports),
        })),
        authenticatorSelection: {
            // Prefer platform authenticators (Touch ID, Face ID, Windows Hello)
            authenticatorAttachment: 'platform',
            // Require user verification (biometric/PIN)
            userVerification: 'required',
            // Allow discoverable credentials (passkeys)
            residentKey: 'required',
        },
    })

    // Store challenge with nickname for verification
    storeChallenge(`register_${nickname}`, options.challenge)

    return {
        options,
        tempUserId,
    }
})
