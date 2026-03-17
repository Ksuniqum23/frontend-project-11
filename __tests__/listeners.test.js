import {
  describe, it, expect, vi, beforeEach,
} from 'vitest'

import { submitHandler, previewBtnHandler } from '../src/controller/handlers.js'
import initListeners from '../src/view/listeners.js'

// Mock handlers
vi.mock('../src/controller/handlers.js', () => ({
  submitHandler: vi.fn(),
  previewBtnHandler: vi.fn(),
}))

vi.mock('../src/state/state.js', () => ({
  default: {
    data: {
      feeds: {},
      posts: {
        'http://post.com/1': { title: 'Post 1', description: 'D1', link: 'http://post.com/1' },
      },
    },
    ui: { rssLinksOrder: [], postsOrder: {}, readPosts: [] },
  },
}))

describe('initListeners', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = `
      <form id="rss-form">
        <input id="rss-input" value="https://example.com/feed" />
        <button type="submit">Add</button>
      </form>
      <ul id="ulPosts">
        <li>
          <a href="http://post.com/1">Post 1</a>
          <button data-post-link="http://post.com/1">Preview</button>
        </li>
      </ul>
    `
  })

  it('should attach submit handler to the form', () => {
    initListeners()

    const form = document.getElementById('rss-form')
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
    form.dispatchEvent(submitEvent)

    expect(submitHandler).toHaveBeenCalledWith('https://example.com/feed')
  })

  // it('should prevent default on form submit', () => {
  //   initListeners()
  //
  //   const form = document.getElementById('rss-form')
  //   const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
  //   const prevented = !form.dispatchEvent(submitEvent)
  //
  //   // Event should be prevented (dispatchEvent returns false if preventDefault was called)
  //   // Note: in jsdom, we check via the handler mock
  //   expect(submitHandler).toHaveBeenCalled()
  // })

  it('should attach click handler for preview buttons', () => {
    initListeners()

    const btn = document.querySelector('[data-post-link]')
    btn.click()

    expect(previewBtnHandler).toHaveBeenCalled()
  })

  it('should pass correct post data to previewBtnHandler', () => {
    initListeners()

    const btn = document.querySelector('[data-post-link="http://post.com/1"]')
    btn.click()

    expect(previewBtnHandler).toHaveBeenCalledWith({
      title: 'Post 1',
      description: 'D1',
      link: 'http://post.com/1',
    })
  })

  it('should not call previewBtnHandler when clicking non-button element', () => {
    initListeners()

    const postList = document.getElementById('ulPosts')
    const clickEvent = new MouseEvent('click', { bubbles: true })
    // Click on the ul itself, not on a button
    postList.dispatchEvent(clickEvent)

    expect(previewBtnHandler).not.toHaveBeenCalled()
  })
})
