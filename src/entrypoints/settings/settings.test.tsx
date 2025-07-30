import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { Settings } from './settings'

describe('Settings', () => {
  it('should render without crashing', () => {
    render(<Settings />)
    expect(screen.getByText('Chat Connect Settings')).toBeDefined()
  })
})
