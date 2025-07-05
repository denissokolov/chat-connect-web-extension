import { beforeAll, beforeEach, describe, it, expect, vi } from 'vitest'

import { getH1Text } from './getH1Text'

describe('html getH1Text', () => {
  beforeAll(() => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      width: 100,
      height: 100,
    } as DOMRect)
  })

  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('returns null if no h1 is present', () => {
    expect(getH1Text()).toBeNull()
  })

  it('returns text from a visible h1', () => {
    const el = document.createElement('h1')
    el.innerText = 'Visible Heading'
    document.body.appendChild(el)

    expect(getH1Text()).toBe('Visible Heading')
  })

  it('ignores hidden h1 elements', () => {
    const hidden = document.createElement('h1')
    hidden.innerText = 'Hidden Heading'
    hidden.style.display = 'none'
    document.body.appendChild(hidden)

    expect(getH1Text()).toBeNull()
  })

  it('ignores h1 elements with opacity 0 or visibility hidden', () => {
    const h1 = document.createElement('h1')
    h1.innerText = 'Invisible'
    h1.style.visibility = 'hidden'
    document.body.appendChild(h1)

    expect(getH1Text()).toBeNull()
  })

  it('returns first visible h1 when multiple are present', () => {
    const hidden = document.createElement('h1')
    hidden.innerText = 'Hidden H1'
    hidden.style.display = 'none'
    document.body.appendChild(hidden)

    const visible = document.createElement('h1')
    visible.innerText = 'Visible H1'
    document.body.appendChild(visible)

    const second = document.createElement('h1')
    second.innerText = 'Second H1'
    document.body.appendChild(second)

    expect(getH1Text()).toBe('Visible H1')
  })

  it('returns text from a h1 with visible parent', () => {
    const hiddenParent = document.createElement('div')
    hiddenParent.style.display = 'none'
    hiddenParent.style.visibility = 'hidden'
    hiddenParent.style.opacity = '0'
    document.body.appendChild(hiddenParent)

    const hiddenH1 = document.createElement('h1')
    hiddenH1.innerText = 'Hidden H1'
    hiddenParent.appendChild(hiddenH1)

    const parent = document.createElement('div')
    parent.style.display = 'block'
    parent.style.visibility = 'visible'
    parent.style.opacity = '1'
    document.body.appendChild(parent)

    const h1 = document.createElement('h1')
    h1.innerText = 'Visible H1'
    parent.appendChild(h1)

    expect(getH1Text()).toBe('Visible H1')
  })

  it('returns null if the h1 has no width or height', () => {
    const h1 = document.createElement('h1')
    h1.innerText = 'Visible H1'
    document.body.appendChild(h1)

    h1.getBoundingClientRect = () =>
      ({
        width: 0,
        height: 0,
      }) as DOMRect

    expect(getH1Text()).toBeNull()
  })
})
