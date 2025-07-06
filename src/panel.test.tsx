import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { Panel } from './panel'

describe('Panel', () => {
  it('should render without crashing', () => {
    render(<Panel />)
    expect(screen.getByTitle('Show chat history')).toBeDefined()
    expect(screen.getByTitle('Start new chat')).toBeDefined()
  })
})
