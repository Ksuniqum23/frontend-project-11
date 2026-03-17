import { describe, it, expect } from 'vitest'
import throwIfInvalidRSS from '../src/controller/validateRss.js'

const createXmlDoc = (xmlString) => {
  const parser = new DOMParser()
  return parser.parseFromString(xmlString, 'application/xml')
}

describe('throwIfInvalidRSS', () => {
  it('should not throw for valid RSS with items', () => {
    const xml = createXmlDoc(`
      <rss>
        <channel>
          <title>Feed</title>
          <item><title>Post</title><link>http://example.com</link></item>
        </channel>
      </rss>
    `)
    expect(() => throwIfInvalidRSS(xml)).not.toThrow()
  })

  it('should throw "errors.invalidXml" for XML with parsererror', () => {
    const xml = createXmlDoc('<unclosed>')
    expect(() => throwIfInvalidRSS(xml)).toThrow('errors.invalidXml')
  })

  it('should throw "errors.invalidRss" for valid XML without items', () => {
    const xml = createXmlDoc(`
      <rss>
        <channel>
          <title>Feed</title>
          <description>No posts here</description>
        </channel>
      </rss>
    `)
    expect(() => throwIfInvalidRSS(xml)).toThrow('errors.invalidRss')
  })

  it('should not throw for RSS with multiple items', () => {
    const xml = createXmlDoc(`
      <rss>
        <channel>
          <item><title>Post 1</title></item>
          <item><title>Post 2</title></item>
          <item><title>Post 3</title></item>
        </channel>
      </rss>
    `)
    expect(() => throwIfInvalidRSS(xml)).not.toThrow()
  })
})
