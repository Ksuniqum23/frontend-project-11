import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock all dependencies
vi.mock('../src/controller/validateUrl.js', () => ({
    default: {
        validate: vi.fn(),
    },
}))

vi.mock('../src/controller/fetchRss.js', () => ({
    default: vi.fn(),
}))

vi.mock('../src/controller/parseXml.js', () => ({
    default: vi.fn(),
}))

vi.mock('../src/controller/validateRss.js', () => ({
    default: vi.fn(),
}))

vi.mock('../src/state/state.js', () => ({
    default: {
        data: { feeds: {}, posts: {} },
        ui: { rssLinksOrder: [], postsOrder: {}, readPosts: [] },
    },
}))

vi.mock('../src/state/updateState.js', () => ({
    addNewRssInState: vi.fn(),
    addNewPostsInState: vi.fn(),
    addReadPostInState: vi.fn(),
}))

vi.mock('../src/view/render.js', () => ({
    updateUI: vi.fn(),
    updateFeedback: vi.fn(),
    modalRender: vi.fn(),
}))

import validateURL from '../src/controller/validateUrl.js'
import fetchRSS from '../src/controller/fetchRss.js'
import parseXML from '../src/controller/parseXml.js'
import validateRss from '../src/controller/validateRss.js'
import { addNewRssInState, addReadPostInState } from '../src/state/updateState.js'
import { updateFeedback, modalRender, updateUI } from '../src/view/render.js'
import { submitHandler, previewBtnHandler } from '../src/controller/handlers.js'

describe('handlers', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Set up minimal DOM for handlers
        document.body.innerHTML = '<input id="rss-input" value="test" />'
    })

    describe('submitHandler', () => {
        it('should process valid RSS successfully', async () => {
            const mockXmlDoc = { querySelector: vi.fn() }
            validateURL.validate.mockResolvedValue(true)
            fetchRSS.mockResolvedValue('<rss/>')
            parseXML.mockReturnValue(mockXmlDoc)
            validateRss.mockReturnValue(undefined)

            const result = await submitHandler('https://example.com/feed')

            expect(validateURL.validate).toHaveBeenCalled()
            expect(fetchRSS).toHaveBeenCalledWith('https://example.com/feed')
            expect(parseXML).toHaveBeenCalledWith('<rss/>')
            expect(validateRss).toHaveBeenCalledWith(mockXmlDoc)
            expect(addNewRssInState).toHaveBeenCalled()
            expect(updateFeedback).toHaveBeenCalledWith('success', 'success.addRSS')
            expect(result).toBe(mockXmlDoc)
        })

        it('should clear input after successful submit', async () => {
            validateURL.validate.mockResolvedValue(true)
            fetchRSS.mockResolvedValue('<rss/>')
            parseXML.mockReturnValue({})
            validateRss.mockReturnValue(undefined)

            await submitHandler('https://example.com/feed')

            const input = document.getElementById('rss-input')
            expect(input.value).toBe('')
        })

        it('should show error on validation failure', async () => {
            const error = new Error('Ссылка должна быть валидным URL')
            validateURL.validate.mockRejectedValue(error)

            await expect(submitHandler('invalid')).rejects.toThrow()
            expect(updateFeedback).toHaveBeenCalledWith('danger', error.message)
        })

        it('should show error on fetch failure', async () => {
            validateURL.validate.mockResolvedValue(true)
            fetchRSS.mockRejectedValue(new Error('errors.network'))

            await expect(submitHandler('https://example.com/feed')).rejects.toThrow()
            expect(updateFeedback).toHaveBeenCalledWith('danger', 'errors.network')
        })

        it('should show error on invalid RSS', async () => {
            validateURL.validate.mockResolvedValue(true)
            fetchRSS.mockResolvedValue('<html/>')
            parseXML.mockReturnValue({})
            validateRss.mockImplementation(() => {
                throw new Error('errors.invalidRss')
            })

            await expect(submitHandler('https://example.com/page')).rejects.toThrow()
            expect(updateFeedback).toHaveBeenCalledWith('danger', 'errors.invalidRss')
        })

        it('should use "errors.unknown" when error has no message', async () => {
            validateURL.validate.mockRejectedValue(new Error(''))

            await expect(submitHandler('test')).rejects.toThrow()
            expect(updateFeedback).toHaveBeenCalledWith('danger', 'errors.unknown')
        })
    })

    describe('previewBtnHandler', () => {
        it('should call addReadPostInState and modalRender', () => {
            const postData = { title: 'P', description: 'D', link: 'http://post.com' }

            previewBtnHandler(postData)

            expect(addReadPostInState).toHaveBeenCalledWith(postData)
            expect(modalRender).toHaveBeenCalledWith(postData)
            expect(updateUI).toHaveBeenCalled()
        })
    })
})
