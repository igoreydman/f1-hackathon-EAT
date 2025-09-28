import { randomBytes } from 'crypto'

/**
 * Generate a cryptographically secure random token
 * @param length - The length of the token (default: 32)
 * @returns A URL-safe random token
 */
export function generateToken(length: number = 32): string {
  return randomBytes(length).toString('base64url')
}

/**
 * Generate all tokens needed for an AMA
 * @returns Object containing hostToken, askToken, answerToken, and digestToken
 */
export function generateAMATokens() {
  return {
    hostToken: generateToken(),
    askToken: generateToken(),
    answerToken: generateToken(),
    digestToken: generateToken(),
  }
}