import { describe, it, expect } from 'vitest'

import { encodeSecureValue, decodeSecureValue, isEncodedValue } from './crypto'

describe('crypto utilities', () => {
  describe('encodeSecureValue', () => {
    it('should encode a value', () => {
      const value = 'my-secret-api-key'
      const key = 'settings.apiKey'

      const encoded = encodeSecureValue(value, key)

      expect(encoded).not.toBe(value)
      expect(encoded).toBeTruthy()
      expect(typeof encoded).toBe('string')
    })

    it('should return empty string for empty value', () => {
      const encoded = encodeSecureValue('', 'test-key')

      expect(encoded).toBe('')
    })

    it('should produce different outputs for different keys', () => {
      const value = 'same-value'

      const encoded1 = encodeSecureValue(value, 'key1')
      const encoded2 = encodeSecureValue(value, 'key2')

      expect(encoded1).not.toBe(encoded2)
    })

    it('should produce same output for same value and key', () => {
      const value = 'consistent-value'
      const key = 'consistent-key'

      const encoded1 = encodeSecureValue(value, key)
      const encoded2 = encodeSecureValue(value, key)

      expect(encoded1).toBe(encoded2)
    })
  })

  describe('decodeSecureValue', () => {
    it('should decode an encoded value', () => {
      const original = 'sk-1234567890abcdef'
      const key = 'settings.token'

      const encoded = encodeSecureValue(original, key)
      const decoded = decodeSecureValue(encoded, key)

      expect(decoded).toBe(original)
    })

    it('should return empty string for empty value', () => {
      const decoded = decodeSecureValue('', 'test-key')

      expect(decoded).toBe('')
    })

    it('should handle special characters', () => {
      const original = 'Test!@#$%^&*()_+-={}[]|:";\'<>?,./🔑'
      const key = 'test-key'

      const encoded = encodeSecureValue(original, key)
      const decoded = decodeSecureValue(encoded, key)

      expect(decoded).toBe(original)
    })

    it('should handle long values', () => {
      const original = 'a'.repeat(1000)
      const key = 'long-key'

      const encoded = encodeSecureValue(original, key)
      const decoded = decodeSecureValue(encoded, key)

      expect(decoded).toBe(original)
    })

    it('should fail to decode with wrong key', () => {
      const original = 'secret-value'
      const encoded = encodeSecureValue(original, 'correct-key')

      const decoded = decodeSecureValue(encoded, 'wrong-key')

      expect(decoded).not.toBe(original)
    })
  })

  describe('isEncodedValue', () => {
    it('should return true for valid Base64 strings', () => {
      const value = 'SGVsbG8gV29ybGQ='

      expect(isEncodedValue(value)).toBe(true)
    })

    it('should return false for empty string', () => {
      expect(isEncodedValue('')).toBe(false)
    })

    it('should return false for non-Base64 strings', () => {
      expect(isEncodedValue('hello world!')).toBe(false)
      expect(isEncodedValue('invalid@base64')).toBe(false)
    })

    it('should return true for encoded values', () => {
      const encoded = encodeSecureValue('test-value', 'test-key')

      expect(isEncodedValue(encoded)).toBe(true)
    })
  })

  describe('round-trip encoding', () => {
    it('should encode and decode multiple times consistently', () => {
      const original = 'multi-pass-value'
      const key = 'multi-key'

      let current = original

      // Encode and decode 5 times
      for (let i = 0; i < 5; i++) {
        const encoded = encodeSecureValue(current, key)
        current = decodeSecureValue(encoded, key)
      }

      expect(current).toBe(original)
    })

    it('should handle JSON strings', () => {
      const original = JSON.stringify({
        apiKey: 'sk-123456',
        server: 'https://api.example.com',
        model: 'gpt-4',
      })
      const key = 'settings'

      const encoded = encodeSecureValue(original, key)
      const decoded = decodeSecureValue(encoded, key)

      expect(decoded).toBe(original)
      expect(JSON.parse(decoded)).toEqual(JSON.parse(original))
    })
  })
})
