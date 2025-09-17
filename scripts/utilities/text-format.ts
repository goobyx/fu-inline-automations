import { UpdateRequest } from '../types/types.js'

export class TextFormat {
  static formatUpdateRequest(request: UpdateRequest): string {
    return `${request.type.toLowerCase()}: ${request.args.join(' ')}`
  }
} 