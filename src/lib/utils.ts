import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get client IP address from request headers
 */
export function getClientIP(request: Request): string {
  // Check common headers for IP address
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback to a default for development
  return '127.0.0.1'
}

/**
 * Validate question text length (140 characters max)
 */
export function validateQuestionLength(text: string): boolean {
  return text.length > 0 && text.length <= 140
}

/**
 * Parse voter IPs from JSON string
 */
export function parseVoterIPs(voterIPs: string): string[] {
  try {
    return JSON.parse(voterIPs || '[]')
  } catch {
    return []
  }
}

/**
 * Stringify voter IPs to JSON
 */
export function stringifyVoterIPs(voterIPs: string[]): string {
  return JSON.stringify(voterIPs)
}