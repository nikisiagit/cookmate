// WebAuthn configuration and utilities
import type { AuthenticatorTransportFuture } from '@simplewebauthn/types'

// In-memory challenge store (for development - use Redis/DB in production)
const challengeStore = new Map<string, { challenge: string; expiresAt: number }>()

// RP (Relying Party) configuration
export function getWebAuthnConfig() {
    const runtimeConfig = useRuntimeConfig()
    const rpID = runtimeConfig.public.webauthnRpId || 'localhost'
    const rpName = 'CookMate'
    const origin = runtimeConfig.public.webauthnOrigin || `https://${rpID}`

    return {
        rpID,
        rpName,
        origin,
    }
}

// Store challenge for user
export function storeChallenge(userId: string, challenge: string) {
    // Challenges expire after 5 minutes
    const expiresAt = Date.now() + 5 * 60 * 1000
    challengeStore.set(userId, { challenge, expiresAt })
}

// Get and consume challenge for user
export function getChallenge(userId: string): string | null {
    const stored = challengeStore.get(userId)
    if (!stored) return null

    // Check if expired
    if (Date.now() > stored.expiresAt) {
        challengeStore.delete(userId)
        return null
    }

    // Consume the challenge (one-time use)
    challengeStore.delete(userId)
    return stored.challenge
}

// Clean up expired challenges periodically
export function cleanupExpiredChallenges() {
    const now = Date.now()
    for (const [userId, data] of challengeStore.entries()) {
        if (now > data.expiresAt) {
            challengeStore.delete(userId)
        }
    }
}

// Parse transports from stored JSON
export function parseTransports(transportsJson: string | null): AuthenticatorTransportFuture[] {
    if (!transportsJson) return []
    try {
        return JSON.parse(transportsJson)
    }
    catch {
        return []
    }
}
