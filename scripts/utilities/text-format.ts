import { UpdateRequest } from '../types/types.js'
import { Parser } from '../services/parser.js'

export class TextFormat {
  static formatUpdateRequest(request: UpdateRequest): string {
    const filteredArgs = request.args.filter(arg => !arg.includes(':') || arg.split(':', 2)[0] === arg)
    const config = Parser.parseTypeConfig(request.args)
    
    const affinityIcons = ['fire', 'bolt', 'earth', 'ice', 'light', 'dark', 'poison', 'air', 'physical']
    let argsText = filteredArgs.join(' ')
    
    affinityIcons.forEach(affinity => {
      const regex = new RegExp(`\\b${affinity}\\b`, 'gi')
      argsText = argsText.replace(regex, `<img src="systems/projectfu/styles/static/affinities/${affinity}.svg" alt="${affinity}" style="width:16px;height:16px;vertical-align:text-bottom;display:inline;">`)
    })
    
    let result = `${request.type.toLowerCase()}: ${argsText}`
    
    if (config.event) {
      result += `<br><em>expiration: ${config.event}</em>`
    }
    
    return result
  }
} 