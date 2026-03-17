import { describe, it, expect } from 'vitest'
import state from '../src/state/state.js'

describe('state', () => {
  it('should have correct initial structure', () => {
    expect(state).toHaveProperty('data')
    expect(state).toHaveProperty('ui')
  })

  it('should have empty data.feeds object', () => {
    expect(state.data.feeds).toBeDefined()
    expect(typeof state.data.feeds).toBe('object')
  })

  it('should have empty data.posts object', () => {
    expect(state.data.posts).toBeDefined()
    expect(typeof state.data.posts).toBe('object')
  })

  it('should have empty ui.rssLinksOrder array', () => {
    expect(state.ui.rssLinksOrder).toBeDefined()
    expect(Array.isArray(state.ui.rssLinksOrder)).toBe(true)
  })

  it('should have ui.postsOrder object', () => {
    expect(state.ui.postsOrder).toBeDefined()
    expect(typeof state.ui.postsOrder).toBe('object')
  })

  it('should have empty ui.readPosts array', () => {
    expect(state.ui.readPosts).toBeDefined()
    expect(Array.isArray(state.ui.readPosts)).toBe(true)
  })
})
