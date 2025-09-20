import { Logger } from './logger.js'

export class HtmlSanitizer {
  private static readonly ALLOWED_TAGS = new Set([
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'span', 'div',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li'
  ])

  private static readonly ALLOWED_ATTRIBUTES = new Set([ 'class', 'id' ])

  static parseHtmlSafely(htmlString: string): Document {
    if (!htmlString || typeof htmlString !== 'string') {
      const error = new Error('Invalid HTML string provided - expected non-empty string')
      Logger.error(`HtmlSanitizer: ${error.message}`)
      throw error
    }

    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlString, 'text/html')
      const parserError = doc.querySelector('parsererror')
      if (parserError) {
        const error = new Error(`HTML parsing error: ${parserError.textContent || 'Unknown parsing error'}`)
        Logger.error(`HtmlSanitizer: ${error.message}`)
        throw error
      }
      
      this.filterAndSecureParagraphs(doc)
      return doc
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      const wrappedError = new Error(`Unexpected error during HTML sanitization: ${String(error)}`)
      Logger.error(`HtmlSanitizer: ${wrappedError.message}`)
      throw wrappedError
    }
  }

  private static filterAndSecureParagraphs(doc: Document): void {
    const paragraphs = Array.from(doc.querySelectorAll('p'))
    paragraphs.forEach(p => { this.secureParagraphElement(p) })

    if (doc.body) {
      doc.body.innerHTML = ''
      paragraphs.forEach(p => { doc.body.appendChild(p) })
    }
  }

  private static secureParagraphElement(p: Element): void {
    const attributes = Array.from(p.attributes)
    attributes.forEach(attr => {
      const attrName = attr.name.toLowerCase()
      const attrValue = attr.value.toLowerCase()
      
      if (attrName.startsWith('on')) {
        p.removeAttribute(attr.name)
        Logger.warn(`HtmlSanitizer: Removed event handler attribute: ${attr.name}`)
        return
      }

      if (attrValue.includes('javascript:') || 
          attrValue.includes('data:') || 
          attrValue.includes('vbscript:') ||
          attrValue.includes('file:') ||
          attrValue.includes('about:')) {
        p.removeAttribute(attr.name)
        Logger.warn(`HtmlSanitizer: Removed dangerous protocol in attribute: ${attr.name}`)
        return
      }

      if (attrName === 'style' && (
          attrValue.includes('expression') ||
          attrValue.includes('behavior') ||
          attrValue.includes('binding') ||
          attrValue.includes('import') ||
          attrValue.includes('url('))) {
        p.removeAttribute(attr.name)
        Logger.warn(`HtmlSanitizer: Removed dangerous CSS in style attribute`)
        return
      }
      
      if (!this.ALLOWED_ATTRIBUTES.has(attrName)) {
        p.removeAttribute(attr.name)
      }
    })

    if (p.textContent) {
      const sanitizedText = this.sanitizeTextContent(p.textContent)
      if (sanitizedText !== p.textContent) {
        p.textContent = sanitizedText
        Logger.warn(`HtmlSanitizer: Sanitized suspicious text content in paragraph`)
      }
    }
  }

  private static sanitizeTextContent(text: string): string {
    return text
      .replace(/&lt;script/gi, '&amp;lt;script')  // Double-escape script tags
      .replace(/&lt;\/script/gi, '&amp;lt;/script')
      .replace(/javascript:/gi, 'blocked:')        // Block javascript protocol
      .replace(/data:/gi, 'blocked:')              // Block data protocol
      .replace(/vbscript:/gi, 'blocked:')          // Block vbscript protocol
  }

  static extractTextSafely(htmlString: string): string {
    if (!htmlString || typeof htmlString !== 'string') return ''

    try {
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = htmlString
      
      const scripts = tempDiv.querySelectorAll('script, style')
      scripts.forEach(el => el.remove())
      
      return tempDiv.textContent || tempDiv.innerText || ''
    } catch (error) {
      Logger.warn(`HtmlSanitizer: Failed to extract text safely, falling back to empty string - ${error}`)
      return ''
    }
  }
} 