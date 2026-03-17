import {
  describe, it, expect, vi, beforeEach,
} from 'vitest'

import state from '../src/state/state.js'
import { addNewRssInState, addNewPostsInState, addReadPostInState } from '../src/state/updateState.js'

// Mock render to avoid DOM operations
vi.mock('../src/view/render.js', () => ({
  updateUI: vi.fn(),
  updateFeedback: vi.fn(),
  modalRender: vi.fn(),
}))

const createXmlDoc = (xmlString) => {
  const parser = new DOMParser()
  return parser.parseFromString(xmlString, 'application/xml')
}

const sampleRssXml = `
  <rss version="2.0">
    <channel>
      <title>Test Feed</title>
      <description>A test feed description</description>
      <item>
        <title>Post 1</title>
        <link>http://example.com/post1</link>
        <description>First post description</description>
      </item>
      <item>
        <title>Post 2</title>
        <link>http://example.com/post2</link>
        <description>Second post description</description>
      </item>
    </channel>
  </rss>
`

describe('updateState', () => {
  beforeEach(() => {
    // Reset state before each test
    state.data.feeds = {}
    state.data.posts = {}
    state.ui.rssLinksOrder = []
    state.ui.postsOrder = {}
    state.ui.readPosts = []
    vi.clearAllMocks()
  })

  describe('addNewRssInState', () => {
    it('should add feed data to state', () => {
      const xmlDoc = createXmlDoc(sampleRssXml)
      const rssLink = 'https://example.com/feed'

      addNewRssInState(xmlDoc, rssLink)

      expect(state.data.feeds[rssLink]).toBeDefined()
      expect(state.data.feeds[rssLink].title).toBe('Test Feed')
      expect(state.data.feeds[rssLink].description).toBe('A test feed description')
    })

    it('should add posts to state', () => {
      const xmlDoc = createXmlDoc(sampleRssXml)
      const rssLink = 'https://example.com/feed'

      addNewRssInState(xmlDoc, rssLink)

      expect(state.data.posts['http://example.com/post1']).toBeDefined()
      expect(state.data.posts['http://example.com/post1'].title).toBe('Post 1')
      expect(state.data.posts['http://example.com/post2']).toBeDefined()
    })

    it('should add rssLink to rssLinksOrder', () => {
      const xmlDoc = createXmlDoc(sampleRssXml)
      const rssLink = 'https://example.com/feed'

      addNewRssInState(xmlDoc, rssLink)

      expect(state.ui.rssLinksOrder).toContain(rssLink)
    })

    it('should add post order for the feed', () => {
      const xmlDoc = createXmlDoc(sampleRssXml)
      const rssLink = 'https://example.com/feed'

      addNewRssInState(xmlDoc, rssLink)

      expect(state.ui.postsOrder[rssLink]).toBeDefined()
      expect(state.ui.postsOrder[rssLink].length).toBe(2)
    })

    it('should handle feed without title/description', () => {
      const xml = createXmlDoc(`
        <rss><channel>
          <item><title>Post</title><link>http://x.com/p</link><description>D</description></item>
        </channel></rss>
      `)
      addNewRssInState(xml, 'http://x.com/feed')

      expect(state.data.feeds['http://x.com/feed'].title).toBe('Без заголовка')
      expect(state.data.feeds['http://x.com/feed'].description).toBe('Без описания')
    })

    it('should not add duplicate posts', () => {
      const xmlDoc = createXmlDoc(sampleRssXml)
      const rssLink = 'https://example.com/feed'

      addNewRssInState(xmlDoc, rssLink)
      const postCountBefore = Object.keys(state.data.posts).length

      // Add the same RSS again with a different link key
      const rssLink2 = 'https://example.com/feed2'
      addNewRssInState(xmlDoc, rssLink2)
      const postCountAfter = Object.keys(state.data.posts).length

      // Posts should not be duplicated
      expect(postCountAfter).toBe(postCountBefore)
    })
  })

  describe('addNewPostsInState', () => {
    it('should add new posts to existing feed', () => {
      const rssLink = 'https://example.com/feed'
      state.ui.postsOrder[rssLink] = []

      const xmlDoc = createXmlDoc(`
        <rss><channel>
          <item>
            <title>New Post</title>
            <link>http://example.com/new-post</link>
            <description>New post desc</description>
          </item>
        </channel></rss>
      `)

      addNewPostsInState(rssLink, ['http://example.com/new-post'], xmlDoc)

      expect(state.data.posts['http://example.com/new-post']).toBeDefined()
      expect(state.data.posts['http://example.com/new-post'].title).toBe('New Post')
      expect(state.ui.postsOrder[rssLink]).toContain('http://example.com/new-post')
    })

    it('should unshift new posts to beginning of order', () => {
      const rssLink = 'https://example.com/feed'
      state.ui.postsOrder[rssLink] = ['http://example.com/old-post']

      const xmlDoc = createXmlDoc(`
        <rss><channel>
          <item>
            <title>New Post</title>
            <link>http://example.com/new-post</link>
            <description>Desc</description>
          </item>
        </channel></rss>
      `)

      addNewPostsInState(rssLink, ['http://example.com/new-post'], xmlDoc)

      expect(state.ui.postsOrder[rssLink][0]).toBe('http://example.com/new-post')
    })

    it('should only add posts from postsLinksArr', () => {
      const rssLink = 'https://example.com/feed'
      state.ui.postsOrder[rssLink] = []

      const xmlDoc = createXmlDoc(`
        <rss><channel>
          <item><title>P1</title><link>http://example.com/p1</link><description>D1</description></item>
          <item><title>P2</title><link>http://example.com/p2</link><description>D2</description></item>
        </channel></rss>
      `)

      // Only add p1, not p2
      addNewPostsInState(rssLink, ['http://example.com/p1'], xmlDoc)

      expect(state.data.posts['http://example.com/p1']).toBeDefined()
      expect(state.data.posts['http://example.com/p2']).toBeUndefined()
    })
  })

  describe('addReadPostInState', () => {
    it('should add post link to readPosts', () => {
      const postData = { link: 'http://example.com/post1', title: 'Post 1' }

      addReadPostInState(postData)

      expect(state.ui.readPosts).toContain('http://example.com/post1')
    })

    it('should accumulate multiple read posts', () => {
      addReadPostInState({ link: 'http://example.com/p1' })
      addReadPostInState({ link: 'http://example.com/p2' })

      expect(state.ui.readPosts.length).toBe(2)
    })
  })
})
