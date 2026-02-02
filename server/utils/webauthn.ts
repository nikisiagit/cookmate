// WebAuthn configuration and utilities
import type { AuthenticatorTransportFuture } from '@simplewebauthn/types'

// In-memory challenge store (for development - use Redis/DB in production)
const challengeStore = new Map<string, { challenge: string; expiresAt: number }>()

// RP (Relying Party) configuration
export function getWebAuthnConfig() {
    // For server-side, read directly from process.env (Cloudflare Pages secrets)
    // Fall back to runtime config for local development
    const rpID = process.env.NUXT_PUBLIC_WEBAUTHN_RP_ID
        || useRuntimeConfig().public.webauthnRpId
        || 'localhost'

    const origin = process.env.NUXT_PUBLIC_WEBAUTHN_ORIGIN
        || useRuntimeConfig().public.webauthnOrigin
        || `http://${rpID === 'localhost' ? 'localhost:3000' : rpID}`

    return {
        rpID,
        rpName: 'CookMate',
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
