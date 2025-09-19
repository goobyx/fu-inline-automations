import { RequestType } from '../types/enums.js'
import { UpdateRequest, ParsedComponents, ParsedEffects } from '../types/types.js'
import { Logger } from '../utilities/logger.js'

export class Parser {
  static parseHtmlEffects(htmlString: string): ParsedEffects {
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlString, 'text/html')
    const paragraphs = Array.from(doc.querySelectorAll('p'))

    const selfEffects: ParsedComponents = { mandatory: [], choice: [] }
    const targetEffects: ParsedComponents = { mandatory: [], choice: [] }

    for (const p of paragraphs) {
      if (!p.textContent?.includes('@')) continue

      const text = p.textContent?.trim() || ''
      const colonIndex = text.indexOf(':')
      const firstComponentIndex = text.indexOf('@')
      if (colonIndex === -1 || firstComponentIndex === -1 || colonIndex >= firstComponentIndex) continue

      const lowerText = text.toLowerCase()
      const parsed = Parser.parseComponents(text)

      if (lowerText.includes('you')) {
        selfEffects.mandatory.push(...parsed.mandatory)
        selfEffects.choice.push(...parsed.choice)
      } else if (lowerText.includes('target')) {
        targetEffects.mandatory.push(...parsed.mandatory)
        targetEffects.choice.push(...parsed.choice)
      }
    }

    const selfTotal = selfEffects.mandatory.length + selfEffects.choice.length
    const targetTotal = targetEffects.mandatory.length + targetEffects.choice.length
    Logger.log(`Parsed effects - Self: ${selfTotal} (${selfEffects.mandatory.length} mandatory, ${selfEffects.choice.length} choice), Target: ${targetTotal} (${targetEffects.mandatory.length} mandatory, ${targetEffects.choice.length} choice)`)

    return { self: selfEffects, target: targetEffects }
  }

  private static parseComponents(text: string): ParsedComponents {
    const parenthesesMatch = text.match(/\(([^)]*)\)/)
    if (!parenthesesMatch) 
      return { mandatory: Parser.parseComponentsFromText(text), choice: [] }
    
    const choiceText = parenthesesMatch[1]
    const textWithoutParentheses = text.replace(/\([^)]*\)/, '')
    return { 
      mandatory: Parser.parseComponentsFromText(textWithoutParentheses),
      choice: Parser.parseComponentsFromText(choiceText)
    }
  }

  private static parseComponentsFromText(text: string): UpdateRequest[] {
    const components: UpdateRequest[] = []
    const componentRegex = /@([A-Z]+)\[([^\]]*)\](?:\{([^}]*)\})?/g // @WORD[content]{optional} pattern

    let match
    while ((match = componentRegex.exec(text)) !== null) {
      const args = match[2].split(/\s+/).filter(arg => arg.length > 0)
      components.push({ type: match[1] as RequestType, args, title: match[3] || undefined })
    }

    return components
  }

  static parseTypeConfig(args: string[]): any {
    const eventMap: { [key: string]: string } = { sot: 'startOfTurn', eot: 'endOfTurn' }
    const config: any = {}

    for (const arg of args) {
      const [prefix, value] = arg.split(':', 2)
      if (prefix === arg) continue
      if (prefix === 'e') config.event = eventMap[value] || value
      else if (prefix === 'i') config.interval = parseInt(value, 10)
      else if (prefix === 't') config.tracking = value
    }

    return config
  }
} 