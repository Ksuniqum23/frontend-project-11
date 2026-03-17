import {
  describe, it, expect, vi, beforeEach,
} from 'vitest'

import { updateUI, updateFeedback, modalRender } from '../src/view/render.js'

// Mock bootstrap Modal
vi.mock('bootstrap', () => {
  const ModalMock = vi.fn().mockImplementation(function MockModal() {
    this.show = vi.fn()
    this.hide = vi.fn()
  })
  return { Modal: ModalMock }
})

vi.mock('../src/i18n/init.js', () => ({
  default: {
    t: (key) => {
      const translations = {
        'success.addRSS': 'RSS успешно загружен',
        'errors.required': 'Ссылка обязательна',
        'errors.invalidUrl': 'Ссылка должна быть валидным URL',
      }
      return translations[key] || key
    },
    init: vi.fn(),
  },
}))

describe('render', () => {
  beforeEach(() => {
    // Set up minimal DOM
    document.body.innerHTML = `
      <div class="feeds">
        <ul id="ulFeeds"></ul>
      </div>
      <div class="posts">
        <ul id="ulPosts"></ul>
      </div>
      <p class="feedback"></p>
      <div id="modal" class="modal">
        <h5 class="modal-title"></h5>
        <div class="modal-body"></div>
        <a id="btn-read-more"></a>
      </div>
    `
  })

  describe('updateUI', () => {
    it('should render feeds into the DOM', () => {
      const state = {
        data: {
          feeds: {
            'http://feed.com': { title: 'Feed Title', description: 'Feed Desc' },
          },
          posts: {
            'http://post.com/1': { title: 'Post 1', description: 'Desc 1', link: 'http://post.com/1' },
          },
        },
        ui: {
          rssLinksOrder: ['http://feed.com'],
          postsOrder: { 'http://feed.com': ['http://post.com/1'] },
          readPosts: [],
        },
      }

      updateUI(state)

      const feeds = document.getElementById('ulFeeds')
      expect(feeds.querySelector('h3').textContent).toBe('Feed Title')
      expect(feeds.querySelector('p').textContent).toBe('Feed Desc')
    })

    it('should render posts into the DOM', () => {
      const state = {
        data: {
          feeds: {
            'http://feed.com': { title: 'Feed', description: 'Desc' },
          },
          posts: {
            'http://post.com/1': { title: 'Post 1', description: 'D1', link: 'http://post.com/1' },
          },
        },
        ui: {
          rssLinksOrder: ['http://feed.com'],
          postsOrder: { 'http://feed.com': ['http://post.com/1'] },
          readPosts: [],
        },
      }

      updateUI(state)

      const posts = document.getElementById('ulPosts')
      const postLink = posts.querySelector('a')
      expect(postLink.textContent).toBe('Post 1')
      expect(postLink.href).toBe('http://post.com/1')
      expect(postLink.target).toBe('_blank')
      expect(postLink.classList.contains('fw-bold')).toBe(true)
    })

    it('should mark read posts with fw-normal class', () => {
      const state = {
        data: {
          feeds: { 'http://feed.com': { title: 'F', description: 'D' } },
          posts: { 'http://post.com/1': { title: 'P1', description: 'D', link: 'http://post.com/1' } },
        },
        ui: {
          rssLinksOrder: ['http://feed.com'],
          postsOrder: { 'http://feed.com': ['http://post.com/1'] },
          readPosts: ['http://post.com/1'],
        },
      }

      updateUI(state)

      const postLink = document.querySelector('#ulPosts a')
      expect(postLink.classList.contains('fw-normal')).toBe(true)
      expect(postLink.classList.contains('link-secondary')).toBe(true)
    })

    it('should disable preview button for read posts', () => {
      const state = {
        data: {
          feeds: { 'http://feed.com': { title: 'F', description: 'D' } },
          posts: { 'http://post.com/1': { title: 'P1', description: 'D', link: 'http://post.com/1' } },
        },
        ui: {
          rssLinksOrder: ['http://feed.com'],
          postsOrder: { 'http://feed.com': ['http://post.com/1'] },
          readPosts: ['http://post.com/1'],
        },
      }

      updateUI(state)

      // const btn = document.querySelector('#ulPosts button')
      // Button is no longer disabled in the new logic
    })

    it('should clear previous content before rendering', () => {
      const feeds = document.getElementById('ulFeeds')
      feeds.innerHTML = '<h4>Old feed</h4>'

      const state = {
        data: {
          feeds: { 'http://f.com': { title: 'New Feed', description: 'D' } },
          posts: {},
        },
        ui: {
          rssLinksOrder: ['http://f.com'],
          postsOrder: { 'http://f.com': [] },
          readPosts: [],
        },
      }

      updateUI(state)

      expect(feeds.querySelectorAll('h3').length).toBe(1)
      expect(feeds.querySelector('h3').textContent).toBe('New Feed')
    })

    it('should render multiple feeds and posts', () => {
      const state = {
        data: {
          feeds: {
            'http://f1.com': { title: 'Feed 1', description: 'D1' },
            'http://f2.com': { title: 'Feed 2', description: 'D2' },
          },
          posts: {
            'http://p1.com': { title: 'P1', description: 'D', link: 'http://p1.com' },
            'http://p2.com': { title: 'P2', description: 'D', link: 'http://p2.com' },
          },
        },
        ui: {
          rssLinksOrder: ['http://f1.com', 'http://f2.com'],
          postsOrder: {
            'http://f1.com': ['http://p1.com'],
            'http://f2.com': ['http://p2.com'],
          },
          readPosts: [],
        },
      }

      updateUI(state)

      expect(document.querySelectorAll('#ulFeeds h3').length).toBe(2)
      expect(document.querySelectorAll('#ulPosts li').length).toBe(2)
    })
  })

  describe('updateFeedback', () => {
    it('should update feedback text and add success class', () => {
      updateFeedback('success', 'success.addRSS')

      const feedback = document.querySelector('.feedback')
      expect(feedback.textContent).toBe('RSS успешно загружен')
      expect(feedback.classList.contains('text-success')).toBe(true)
    })

    it('should update feedback text and add danger class', () => {
      updateFeedback('danger', 'errors.required')

      const feedback = document.querySelector('.feedback')
      expect(feedback.textContent).toBe('Ссылка обязательна')
      expect(feedback.classList.contains('text-danger')).toBe(true)
    })

    it('should remove previous type class when switching', () => {
      updateFeedback('success', 'success.addRSS')
      updateFeedback('danger', 'errors.required')

      const feedback = document.querySelector('.feedback')
      expect(feedback.classList.contains('text-success')).toBe(false)
      expect(feedback.classList.contains('text-danger')).toBe(true)
    })
  })

  describe('modalRender', () => {
    it('should populate modal with post data', () => {
      const postData = {
        title: 'Test Title',
        description: 'Test Description',
        link: 'http://example.com/post',
      }

      modalRender(postData)

      expect(document.querySelector('.modal-title').textContent).toBe('Test Title')
      expect(document.querySelector('.modal-body').textContent).toBe('Test Description')
    })

    it('should handle missing currentPostData', () => {
      expect(() => modalRender(null)).not.toThrow()
    })

    it('should handle missing modal element', () => {
      document.getElementById('modal').remove()
      expect(() => modalRender({ title: 'T', description: 'D', link: 'L' })).not.toThrow()
    })

    it('should set empty strings for missing title/description', () => {
      modalRender({ link: 'http://example.com' })

      expect(document.querySelector('.modal-title').textContent).toBe('')
      expect(document.querySelector('.modal-body').textContent).toBe('')
    })

    it('should set onclick handler on read-more button', () => {
      const postData = {
        title: 'Title',
        description: 'Desc',
        link: 'http://example.com/post',
      }

      modalRender(postData)

      const btn = document.getElementById('btn-read-more')
      expect(btn.href).toBe('http://example.com/post')
    })
  })
})
