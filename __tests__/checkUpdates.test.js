import {
  describe, it, expect, vi, beforeEach, afterEach,
} from 'vitest'

import state from '../src/state/state.js'
import checkUpdates from '../src/controller/checkUpdates.js'

// Use vi.hoisted so mock fns are available when vi.mock factories run (hoisted)
const { mockFetchRSS, mockParseXML, mockAddNewPostsInState } = vi.hoisted(() => ({
  mockFetchRSS: vi.fn(),
  mockParseXML: vi.fn(),
  mockAddNewPostsInState: vi.fn(),
}))

vi.mock('../src/controller/fetchRss.js', () => ({ default: mockFetchRSS }))
vi.mock('../src/controller/parseXml.js', () => ({ default: mockParseXML }))
vi.mock('../src/state/updateState.js', () => ({
  addNewPostsInState: mockAddNewPostsInState,
  addNewRssInState: vi.fn(),
  addReadPostInState: vi.fn(),
}))
vi.mock('../src/view/render.js', () => ({
  updateUI: vi.fn(),
  updateFeedback: vi.fn(),
  modalRender: vi.fn(),
}))
vi.mock('../src/i18n/init.js', () => ({
  default: { t: key => key, init: vi.fn() },
}))

describe('checkUpdates', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()

    state.data.feeds = {}
    state.data.posts = {}
    state.ui.rssLinksOrder = []
    state.ui.postsOrder = {}
    state.ui.readPosts = []
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should not throw when rssLinksOrder is empty', async () => {
    await expect(checkUpdates()).resolves.toBeUndefined()
  })

  it('should fetch and parse RSS for each link', async () => {
    const rssLink = 'https://example.com/feed'
    state.ui.rssLinksOrder = [rssLink]

    const mockXml = '<rss><channel><item><link>http://example.com/p1</link></item></channel></rss>'
    mockFetchRSS.mockResolvedValue(mockXml)

    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(mockXml, 'application/xml')
    mockParseXML.mockReturnValue(xmlDoc)

    await checkUpdates()

    expect(mockFetchRSS).toHaveBeenCalledWith(rssLink)
    expect(mockParseXML).toHaveBeenCalledWith(mockXml)
  })

  it('should call addNewPostsInState when new posts found', async () => {
    const rssLink = 'https://example.com/feed'
    state.ui.rssLinksOrder = [rssLink]

    const mockXml = '<rss><channel><item><link>http://new.com</link></item></channel></rss>'
    mockFetchRSS.mockResolvedValue(mockXml)

    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(mockXml, 'application/xml')
    mockParseXML.mockReturnValue(xmlDoc)

    await checkUpdates()

    expect(mockAddNewPostsInState).toHaveBeenCalled()
  })

  it('should not add posts when all already exist', async () => {
    const rssLink = 'https://example.com/feed'
    state.ui.rssLinksOrder = [rssLink]
    state.data.posts = {
      'http://existing.com': { link: 'http://existing.com', title: 'E', description: 'D' },
    }

    const mockXml = '<rss><channel><item><link>http://existing.com</link></item></channel></rss>'
    mockFetchRSS.mockResolvedValue(mockXml)

    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(mockXml, 'application/xml')
    mockParseXML.mockReturnValue(xmlDoc)

    await checkUpdates()

    expect(mockAddNewPostsInState).not.toHaveBeenCalled()
  })

  it('should schedule next check with setTimeout', async () => {
    state.ui.rssLinksOrder = []
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout')

    await checkUpdates()

    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 5000)
    setTimeoutSpy.mockRestore()
  })
})
