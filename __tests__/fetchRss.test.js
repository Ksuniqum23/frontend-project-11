import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('axios', () => ({
    default: {
        get: vi.fn(),
    },
}))

vi.mock('../src/i18n/init.js', () => ({
    default: {
        t: (key) => key,
        init: vi.fn(),
    },
}))

import axios from 'axios'
import fetchRSS from '../src/controller/fetchRss.js'

describe('fetchRSS', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should fetch RSS and return contents', async () => {
        const mockContents = '<rss><channel><title>Test</title></channel></rss>'
        axios.get.mockResolvedValue({
            data: { contents: mockContents },
        })

        const result = await fetchRSS('https://example.com/feed')
        expect(result).toBe(mockContents)
        expect(axios.get).toHaveBeenCalledOnce()
        expect(axios.get.mock.calls[0][0]).toContain(encodeURIComponent('https://example.com/feed'))
    })

    it('should throw network error on Network Error', async () => {
        axios.get.mockRejectedValue(new Error('Network Error'))

        await expect(fetchRSS('https://example.com/feed')).rejects.toThrow('errors.network')
    })

    it('should handle non-network errors', async () => {
        axios.get.mockRejectedValue(new Error('Some other error'))

        // Non-network errors don't throw, function returns undefined
        const result = await fetchRSS('https://example.com/feed')
        expect(result).toBeUndefined()
    })

    it('should encode URL in the request', async () => {
        axios.get.mockResolvedValue({
            data: { contents: '<rss/>' },
        })

        await fetchRSS('https://example.com/feed?param=value')
        const calledUrl = axios.get.mock.calls[0][0]
        expect(calledUrl).toContain(encodeURIComponent('https://example.com/feed?param=value'))
        expect(calledUrl).toContain('allorigins.hexlet.app')
    })
})
