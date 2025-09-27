import { describe, it, expect } from 'vitest'

import { shallowEqual } from './object'

describe('shallowEqual', () => {
  describe('reference equality', () => {
    it('should return true when both objects are the same reference', () => {
      const obj = { a: 1, b: 2 }

      const result = shallowEqual(obj, obj)

      expect(result).toBe(true)
    })

    it('should return true when both objects are null', () => {
      const result = shallowEqual(null, null)

      expect(result).toBe(true)
    })

    it('should return true when both objects are undefined', () => {
      const result = shallowEqual(undefined, undefined)

      expect(result).toBe(true)
    })
  })

  describe('null and undefined handling', () => {
    it('should return false when first object is null and second is defined', () => {
      const result = shallowEqual(null, { a: 1 })

      expect(result).toBe(false)
    })

    it('should return false when first object is undefined and second is defined', () => {
      const result = shallowEqual(undefined, { a: 1 })

      expect(result).toBe(false)
    })

    it('should return false when first object is defined and second is null', () => {
      const result = shallowEqual({ a: 1 }, null)

      expect(result).toBe(false)
    })

    it('should return false when first object is defined and second is undefined', () => {
      const result = shallowEqual({ a: 1 }, undefined)

      expect(result).toBe(false)
    })

    it('should return false when first is null and second is undefined', () => {
      const result = shallowEqual(null, undefined)

      expect(result).toBe(false)
    })

    it('should return false when first is undefined and second is null', () => {
      const result = shallowEqual(undefined, null)

      expect(result).toBe(false)
    })
  })

  describe('key length comparison', () => {
    it('should return false when objects have different number of keys', () => {
      const obj1 = { a: 1, b: 2 }
      const obj2 = { a: 1, b: 2, c: 3 }

      const result = shallowEqual(obj1, obj2)

      expect(result).toBe(false)
    })

    it('should return false when first object has more keys', () => {
      const obj1 = { a: 1, b: 2, c: 3, d: 4 }
      const obj2 = { a: 1, b: 2 }

      const result = shallowEqual(obj1, obj2)

      expect(result).toBe(false)
    })

    it('should return true when both objects are empty', () => {
      const result = shallowEqual({}, {})

      expect(result).toBe(true)
    })
  })

  describe('shallow value comparison', () => {
    it('should return true when objects have identical primitive values', () => {
      const obj1 = { a: 1, b: 'hello', c: true, d: null }
      const obj2 = { a: 1, b: 'hello', c: true, d: null }

      const result = shallowEqual(obj1, obj2)

      expect(result).toBe(true)
    })

    it('should return false when objects have different primitive values', () => {
      const obj1 = { a: 1, b: 'hello' }
      const obj2 = { a: 1, b: 'world' }

      const result = shallowEqual(obj1, obj2)

      expect(result).toBe(false)
    })

    it('should return false when key exists in first but not in second object', () => {
      const obj1 = { a: 1, b: 2 }
      const obj2 = { a: 1, c: 2 }

      const result = shallowEqual(obj1, obj2)

      expect(result).toBe(false)
    })

    it('should return false when values have different types', () => {
      const obj1 = { a: 1 }
      const obj2 = { a: '1' }

      const result = shallowEqual(obj1, obj2)

      expect(result).toBe(false)
    })

    it('should return false when comparing number to boolean', () => {
      const obj1 = { a: 1 }
      const obj2 = { a: true }

      const result = shallowEqual(obj1, obj2)

      expect(result).toBe(false)
    })

    it('should return false when comparing null to undefined values', () => {
      const obj1 = { a: null }
      const obj2 = { a: undefined }

      const result = shallowEqual(obj1, obj2)

      expect(result).toBe(false)
    })
  })

  describe('reference comparison for complex values', () => {
    it('should return true when nested objects are the same reference', () => {
      const nested = { x: 1, y: 2 }
      const obj1 = { a: nested, b: 'test' }
      const obj2 = { a: nested, b: 'test' }

      const result = shallowEqual(obj1, obj2)

      expect(result).toBe(true)
    })

    it('should return false when nested objects have same content but different references', () => {
      const obj1 = { a: { x: 1, y: 2 }, b: 'test' }
      const obj2 = { a: { x: 1, y: 2 }, b: 'test' }

      const result = shallowEqual(obj1, obj2)

      expect(result).toBe(false)
    })

    it('should return true when arrays are the same reference', () => {
      const arr = [1, 2, 3]
      const obj1 = { a: arr, b: 'test' }
      const obj2 = { a: arr, b: 'test' }

      const result = shallowEqual(obj1, obj2)

      expect(result).toBe(true)
    })

    it('should return false when arrays have same content but different references', () => {
      const obj1 = { a: [1, 2, 3], b: 'test' }
      const obj2 = { a: [1, 2, 3], b: 'test' }

      const result = shallowEqual(obj1, obj2)

      expect(result).toBe(false)
    })

    it('should return true when functions are the same reference', () => {
      const fn = () => 'test'
      const obj1 = { a: fn, b: 'test' }
      const obj2 = { a: fn, b: 'test' }

      const result = shallowEqual(obj1, obj2)

      expect(result).toBe(true)
    })

    it('should return false when functions have same implementation but different references', () => {
      const obj1 = { a: () => 'test', b: 'test' }
      const obj2 = { a: () => 'test', b: 'test' }

      const result = shallowEqual(obj1, obj2)

      expect(result).toBe(false)
    })
  })

  describe('complex scenarios', () => {
    it('should handle objects with mixed primitive and reference types', () => {
      const shared = { nested: true }
      const obj1 = {
        str: 'hello',
        num: 42,
        bool: true,
        nil: null,
        undef: undefined,
        ref: shared,
      }
      const obj2 = {
        str: 'hello',
        num: 42,
        bool: true,
        nil: null,
        undef: undefined,
        ref: shared,
      }

      const result = shallowEqual(obj1, obj2)

      expect(result).toBe(true)
    })

    it('should return false when one value differs in mixed type object', () => {
      const shared = { nested: true }
      const obj1 = {
        str: 'hello',
        num: 42,
        bool: true,
        nil: null,
        undef: undefined,
        ref: shared,
      }
      const obj2 = {
        str: 'hello',
        num: 43, // Different value
        bool: true,
        nil: null,
        undef: undefined,
        ref: shared,
      }

      const result = shallowEqual(obj1, obj2)

      expect(result).toBe(false)
    })

    it('should handle objects with special numeric values', () => {
      const obj1 = {
        zero: 0,
        negZero: -0,
        nan: NaN,
        inf: Infinity,
        negInf: -Infinity,
      }
      const obj2 = {
        zero: 0,
        negZero: -0,
        nan: NaN,
        inf: Infinity,
        negInf: -Infinity,
      }

      const result = shallowEqual(obj1, obj2)

      // NaN !== NaN in JavaScript, so this should be false
      expect(result).toBe(false)
    })

    it('should handle objects with Date objects', () => {
      const date = new Date('2024-01-01')
      const obj1 = { created: date, updated: date }
      const obj2 = { created: date, updated: date }

      const result = shallowEqual(obj1, obj2)

      expect(result).toBe(true)
    })

    it('should return false when Date objects have same value but different references', () => {
      const obj1 = { created: new Date('2024-01-01') }
      const obj2 = { created: new Date('2024-01-01') }

      const result = shallowEqual(obj1, obj2)

      expect(result).toBe(false)
    })

    it('should handle large objects efficiently', () => {
      const largeObj1: Record<string, number> = {}
      const largeObj2: Record<string, number> = {}

      // Create objects with many properties
      for (let i = 0; i < 1000; i++) {
        largeObj1[`key${i}`] = i
        largeObj2[`key${i}`] = i
      }

      const result = shallowEqual(largeObj1, largeObj2)

      expect(result).toBe(true)
    })

    it('should return false quickly when large objects differ in one property', () => {
      const largeObj1: Record<string, number> = {}
      const largeObj2: Record<string, number> = {}

      // Create objects with many properties
      for (let i = 0; i < 1000; i++) {
        largeObj1[`key${i}`] = i
        largeObj2[`key${i}`] = i
      }

      // Make one property different
      largeObj2.key500 = 999

      const result = shallowEqual(largeObj1, largeObj2)

      expect(result).toBe(false)
    })
  })

  describe('edge cases with object keys', () => {
    it('should handle objects with numeric string keys', () => {
      const obj1 = { '0': 'zero', '1': 'one', '2': 'two' }
      const obj2 = { '0': 'zero', '1': 'one', '2': 'two' }

      const result = shallowEqual(obj1, obj2)

      expect(result).toBe(true)
    })

    it('should handle objects with symbol keys', () => {
      const sym1 = Symbol('test')
      const sym2 = Symbol('test')
      const obj1 = { [sym1]: 'value1', normal: 'test' }
      const obj2 = { [sym2]: 'value1', normal: 'test' }

      const result = shallowEqual(obj1, obj2)

      expect(result).toBe(true)
    })

    it('should handle objects with empty string keys', () => {
      const obj1 = { '': 'empty', a: 1 }
      const obj2 = { '': 'empty', a: 1 }

      const result = shallowEqual(obj1, obj2)

      expect(result).toBe(true)
    })

    it('should handle objects with space-containing keys', () => {
      const obj1 = { 'key with spaces': 'value', 'another key': 'value2' }
      const obj2 = { 'key with spaces': 'value', 'another key': 'value2' }

      const result = shallowEqual(obj1, obj2)

      expect(result).toBe(true)
    })
  })
})
