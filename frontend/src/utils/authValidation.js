/**
 * Authentication validation and client-side password hashing utilities.
 * 
 * Rules:
 * 1. Email: Strict .com validation using regular expressions (rejects @kjgegdv, @dg, etc.)
 * 2. Password: Minimum 6 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special symbol
 * 3. Hashing: Client-side SHA-256 with user-specific email salt so no 2 passwords produce the same network hash
 */

// Strict regex: requires valid local-part + valid domain label(s) ending with .com
export const EMAIL_REGEX = /^[a-zA-Z0-9_.+-]+@(?:[a-zA-Z0-9-]+\.)+com$/i

export function validateEmail(email) {
  const trimmed = (email || '').trim()
  if (!trimmed) {
    return { valid: false, error: 'Email address is required.' }
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return {
      valid: false,
      error: 'Please enter a valid email address ending with .com (e.g. name@company.com). Invalid format or non-.com emails are not allowed.',
    }
  }
  return { valid: true, error: null }
}

export function getPasswordChecks(password = '') {
  return {
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^a-zA-Z0-9\s]/.test(password),
  }
}

export function validatePassword(password) {
  if (!password || password.length === 0) {
    return { valid: false, error: 'Password is required.' }
  }
  const checks = getPasswordChecks(password)
  if (!checks.length) {
    return { valid: false, error: 'Password must be at least 6 characters long.' }
  }
  if (!checks.uppercase) {
    return { valid: false, error: 'Password must contain at least one capital letter (A-Z).' }
  }
  if (!checks.lowercase) {
    return { valid: false, error: 'Password must contain at least one lowercase letter (a-z).' }
  }
  if (!checks.number) {
    return { valid: false, error: 'Password must contain at least one number (0-9).' }
  }
  if (!checks.special) {
    return { valid: false, error: 'Password must contain at least one special symbol (e.g. !@#$%^&*).' }
  }
  return { valid: true, error: null }
}

// Pure JS SHA-256 implementation as reliable fallback for environments without crypto.subtle
function sha256Fallback(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount))
  }

  const mathPow = Math.pow
  const maxWord = mathPow(2, 32)
  const lengthProperty = 'length'
  let i, j
  let result = ''

  const words = []
  const asciiBitLength = ascii[lengthProperty] * 8

  let hash = []
  const k = []
  let primeCounter = 0

  const isComposite = {}
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = candidate
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0
    }
  }

  ascii += '\x80'
  while ((ascii[lengthProperty] % 64) - 56) ascii += '\x00'
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i)
    if (j >> 8) return ''
    words[i >> 2] |= j << ((3 - (i % 4)) * 8)
  }
  words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0
  words[words[lengthProperty]] = asciiBitLength

  for (j = 0; j < words[lengthProperty]; ) {
    const w = words.slice(j, (j += 16))
    const oldHash = hash
    hash = hash.slice(0, 8)

    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15],
        w2 = w[i - 2]
      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10)
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6])
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2])
      const temp1 =
        hash[7] +
        (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) +
        ch +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] + s0 + w[i - 7] + s1) | 0)
      const temp2 =
        (rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) +
        maj

      hash = [(temp1 + temp2) | 0].concat(hash)
      hash[4] = (hash[4] + temp1) | 0
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0
    }
  }

  for (i = 0; i < 8; i++) {
    for (i = 0; i < 8; i++) {
      for (j = 3; j + 1; j--) {
        const b = (hash[i] >> (j * 8)) & 255
        result += (b < 16 ? '0' : '') + b.toString(16)
      }
    }
  }
  return result
}

/**
 * Hashes password on the client side using SHA-256 salted with user's email.
 * This guarantees:
 * 1. Plain text password NEVER travels on the network.
 * 2. No two users with the same password share the same network hash.
 */
export async function hashPasswordClient(plainPassword, email) {
  const normalizedEmail = (email || '').trim().toLowerCase()
  const saltedString = `campaignguard:${normalizedEmail}:${plainPassword}`

  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder()
      const data = encoder.encode(saltedString)
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
    }
  } catch {
    // Fall through to JS fallback
  }

  return sha256Fallback(saltedString)
}
