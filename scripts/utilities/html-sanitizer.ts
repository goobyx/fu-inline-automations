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
      
      this.sanitizeDocument(doc)
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

  private static sanitizeDocument(doc: Document): void {
    const scripts = doc.querySelectorAll('script')
    scripts.forEach(script => script.remove())
    const styles = doc.querySelectorAll('style')
    styles.forEach(style => style.remove())

    const allElements = doc.querySelectorAll('*')
    allElements.forEach(element => {
      this.sanitizeElement(element)
    })
  }

  private static sanitizeElement(element: Element): void {
    const tagName = element.tagName.toLowerCase()
    if (!this.ALLOWED_TAGS.has(tagName)) {
      const textNode = document.createTextNode(element.textContent || '')
      element.parentNode?.replaceChild(textNode, element)
      return
    }

    const attributes = Array.from(element.attributes)
    attributes.forEach(attr => {
      const attrName = attr.name.toLowerCase()
      
      if (attrName.startsWith('on')) {
        element.removeAttribute(attr.name)
        return
      }

      if (attr.value && (
        attr.value.toLowerCase().startsWith('javascript:') ||
        attr.value.toLowerCase().startsWith('data:')
      )) {
        element.removeAttribute(attr.name)
        return
      }
      
      if (!this.ALLOWED_ATTRIBUTES.has(attrName)) {
        element.removeAttribute(attr.name)
      }
    })
  }

  static extractTextSafely(htmlString: string): string {
    if (!htmlString || typeof htmlString !== 'string') {
      return ''
    }

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