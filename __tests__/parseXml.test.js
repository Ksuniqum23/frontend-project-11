import { describe, it, expect } from 'vitest'
import parseXML from '../src/controller/parseXml.js'

describe('parseXML', () => {
    it('should parse valid XML string into a document', () => {
        const xml = '<root><child>text</child></root>'
        const doc = parseXML(xml)
        expect(doc).toBeDefined()
        expect(doc.querySelector('root')).not.toBeNull()
        expect(doc.querySelector('child').textContent).toBe('text')
    })

    it('should return document with correct structure for RSS-like XML', () => {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0">
        <channel>
          <title>Test Feed</title>
          <description>A test feed</description>
          <item>
            <title>Post 1</title>
            <link>http://example.com/1</link>
            <description>First post</description>
          </item>
        </channel>
      </rss>`
        const doc = parseXML(xml)
        expect(doc.querySelector('channel > title').textContent).toBe('Test Feed')
        expect(doc.querySelectorAll('item').length).toBe(1)
    })

    it('should handle empty XML', () => {
        const xml = '<empty/>'
        const doc = parseXML(xml)
        expect(doc.querySelector('empty')).not.toBeNull()
    })

    it('should produce parsererror for malformed XML', () => {
        const xml = '<unclosed>'
        const doc = parseXML(xml)
        // jsdom DOMParser produces parsererror for invalid XML
        expect(doc.querySelector('parsererror')).not.toBeNull()
    })
})
