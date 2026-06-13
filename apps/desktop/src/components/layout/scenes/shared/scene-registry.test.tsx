import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it } from 'vitest'

import { sceneRegistry } from './scene-registry'

describe('scene registry', () => {
  it('exposes a component for every supported mood', () => {
    expect(Object.keys(sceneRegistry)).toEqual([
      'morning',
      'day',
      'evening',
      'night',
    ])
  })

  it('renders each registered scene with a stable data-scene attribute', () => {
    for (const [mood, definition] of Object.entries(sceneRegistry)) {
      const markup = renderToStaticMarkup(<definition.component />)
      expect(markup).toContain(`data-scene="${mood}"`)
    }
  })
})
