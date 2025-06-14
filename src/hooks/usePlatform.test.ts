import { renderHook } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'

import { usePlatform } from './usePlatform'

describe('usePlatform', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns "mac" when navigator.userAgent contains "Mac"', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      configurable: true,
    })

    const { result } = renderHook(() => usePlatform())
    expect(result.current).toBe('mac')
  })

  it('returns "win" when navigator.userAgent does not contain "Mac"', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      configurable: true,
    })

    const { result } = renderHook(() => usePlatform())
    expect(result.current).toBe('win')
  })

  it('returns "win" for Linux user agent', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      configurable: true,
    })

    const { result } = renderHook(() => usePlatform())
    expect(result.current).toBe('win')
  })

  it('returns "mac" when userAgent contains "Mac" in different case variations', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      configurable: true,
    })

    const { result } = renderHook(() => usePlatform())
    expect(result.current).toBe('mac')
  })

  it('returns "win" for empty user agent', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: '',
      configurable: true,
    })

    const { result } = renderHook(() => usePlatform())
    expect(result.current).toBe('win')
  })

  it('returns "mac" for iOS devices', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15',
      configurable: true,
    })

    const { result } = renderHook(() => usePlatform())
    expect(result.current).toBe('mac')
  })

  it('returns "mac" for iPad', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15',
      configurable: true,
    })

    const { result } = renderHook(() => usePlatform())
    expect(result.current).toBe('mac')
  })
})
