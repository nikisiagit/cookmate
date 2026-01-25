// POST /api/passkey/register/start - Generate registration options
import { generateRegistrationOptions } from '@simplewebauthn/server'

export default defineEventHandler(async (event) => {
    const db = useDB()
    const config = getWebAuthnConfig()

    // Auto-generate a unique food-themed nickname
    const allUsers = await db.select({ nickname: tables.user.nickname }).from(tables.user).all()
    const usedNicknames = allUsers.map((u) => u.nickname)
    const nickname = generateUniqueFoodNickname(usedNicknames)

    // Generate a temporary user ID for registration
    const tempUserId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const options = await generateRegistrationOptions({
        rpName: config.rpName,
        rpID: config.rpID,
        userName: nickname,
        userDisplayName: nickname,
        // Don't require attestation for better compatibility
        attestationType: 'none',
        // No existing credentials for new registration
        excludeCredentials: [],
        authenticatorSelection: {
            // Prefer platform authenticators (Touch ID, Face ID, Windows Hello)
            authenticatorAttachment: 'platform',
            // Require user verification (biometric/PIN)
            userVerification: 'required',
            // Allow discoverable credentials (passkeys)
            residentKey: 'required',
        },
    })

    // Store challenge with generated nickname for verification
    storeChallenge(`register_${nickname}`, options.challenge)

    return {
        options,
        nickname,
        tempUserId,
    }
})
