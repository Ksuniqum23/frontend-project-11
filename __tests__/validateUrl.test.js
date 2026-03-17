import { describe, it, expect } from 'vitest'
import validateURL from '../src/controller/validateUrl.js'

describe('validateURL', () => {
  it('should pass for valid http URL', async () => {
    await expect(
      validateURL.validate(
        { url: 'http://example.com/feed' },
        { context: { feeds: [] } },
      ),
    ).resolves.toBeDefined()
  })

  it('should pass for valid https URL', async () => {
    await expect(
      validateURL.validate(
        { url: 'https://example.com/rss' },
        { context: { feeds: [] } },
      ),
    ).resolves.toBeDefined()
  })

  it('should reject URL without protocol', async () => {
    await expect(
      validateURL.validate(
        { url: 'example.com/feed' },
        { context: { feeds: [] } },
      ),
    ).rejects.toThrow()
  })

  it('should reject invalid URL', async () => {
    await expect(
      validateURL.validate(
        { url: 'not-a-url' },
        { context: { feeds: [] } },
      ),
    ).rejects.toThrow()
  })

  it('should reject URL that already exists in feeds', async () => {
    const existingUrl = 'https://example.com/feed'
    await expect(
      validateURL.validate(
        { url: existingUrl },
        { context: { feeds: [existingUrl] } },
      ),
    ).rejects.toThrow()
  })

  it('should reject empty string', async () => {
    await expect(
      validateURL.validate(
        { url: '' },
        { context: { feeds: [] } },
      ),
    ).rejects.toThrow()
  })

  it('should reject when url is undefined', async () => {
    await expect(
      validateURL.validate(
        { url: undefined },
        { context: { feeds: [] } },
      ),
    ).rejects.toThrow()
  })
})
