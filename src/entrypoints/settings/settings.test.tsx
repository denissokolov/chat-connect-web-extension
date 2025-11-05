import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeAll } from 'vitest'

import { Settings } from './settings'

describe('Settings', () => {
  beforeAll(() => {
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  })

  it('should render without crashing', () => {
    render(<Settings />)
    expect(screen.getByText('Chat Connect Settings')).toBeDefined()
  })
})
