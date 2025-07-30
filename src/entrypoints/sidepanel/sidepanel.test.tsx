import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { SidePanel } from './sidepanel'

describe('SidePanel', () => {
  it('should render without crashing', () => {
    render(<SidePanel />)
    expect(screen.getByTitle('Show chat history')).toBeDefined()
    expect(screen.getByTitle('Start new chat')).toBeDefined()
  })
})
