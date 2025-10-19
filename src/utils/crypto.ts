/**
 * Crypto utilities for encoding/decoding secure values
 * Uses Base64 encoding with XOR cipher and salt for basic obfuscation
 */

const STATIC_SALT = 'chat-connect-secure-storage-v2'

/**
 * Simple hash function to create a consistent byte array from a string
 * This ensures different keys produce different cipher keys
 */
function simpleHash(text: string, length: number): Uint8Array {
  const encoder = new TextEncoder()
  const textBytes = encoder.encode(text)
  const result = new Uint8Array(length)

  // Create a deterministic hash by mixing all input bytes
  for (let i = 0; i < length; i++) {
    let value = i + 1
    for (let j = 0; j < textBytes.length; j++) {
      value = (value * 31 + textBytes[j]) & 0xff
    }
    result[i] = value
  }

  return result
}

/**
 * Generates a salted key from the storage key
 */
function generateSaltedKey(key: string, length: number = 256): Uint8Array {
  const fullKey = `${STATIC_SALT}-${key}`
  return simpleHash(fullKey, length)
}

/**
 * XOR cipher - applies XOR operation between data and key
 */
function xorCipher(data: Uint8Array, key: Uint8Array): Uint8Array {
  const result = new Uint8Array(data.length)
  for (let i = 0; i < data.length; i++) {
    // Use modulo to repeat the key if data is longer
    result[i] = data[i] ^ key[i % key.length]
  }
  return result
}

/**
 * Converts Uint8Array to Base64 string
 */
function arrayToBase64(arr: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < arr.length; i++) {
    binary += String.fromCharCode(arr[i])
  }
  return btoa(binary)
}

/**
 * Converts Base64 string to Uint8Array
 */
function base64ToArray(base64: string): Uint8Array {
  const binary = atob(base64)
  const arr = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    arr[i] = binary.charCodeAt(i)
  }
  return arr
}

/**
 * Encodes a value with salt for secure storage
 * @param value - The value to encode
 * @param key - The storage key (used to generate salt)
 * @returns Base64 encoded string
 */
export function encodeSecureValue(value: string, key: string): string {
  if (!value) {
    return ''
  }

  const encoder = new TextEncoder()

  // Convert value to bytes
  const valueBytes = encoder.encode(value)

  // Generate a salted key of appropriate length
  const saltedKey = generateSaltedKey(key, Math.max(valueBytes.length, 256))

  // Apply XOR cipher with salted key
  const cipheredBytes = xorCipher(valueBytes, saltedKey)

  // Convert to Base64
  return arrayToBase64(cipheredBytes)
}

/**
 * Decodes a value that was encoded with encodeSecureValue
 * @param encodedValue - The encoded value
 * @param key - The storage key (used to generate salt)
 * @returns Decoded string
 */
export function decodeSecureValue(encodedValue: string, key: string): string {
  if (!encodedValue) {
    return ''
  }

  const decoder = new TextDecoder()

  // Decode from Base64
  const cipheredBytes = base64ToArray(encodedValue)

  // Generate a salted key of appropriate length
  const saltedKey = generateSaltedKey(key, Math.max(cipheredBytes.length, 256))

  // Apply XOR cipher with salted key (XOR is its own inverse)
  const valueBytes = xorCipher(cipheredBytes, saltedKey)

  // Convert bytes back to string
  return decoder.decode(valueBytes)
}

/**
 * Checks if a value appears to be encoded
 * @param value - The value to check
 * @returns true if the value appears to be Base64 encoded
 */
export function isEncodedValue(value: string): boolean {
  if (!value || value.length === 0) {
    return false
  }

  // Check if it's valid Base64
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
  return base64Regex.test(value)
}
