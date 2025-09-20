import { RequestType } from './enums.js'

export interface UpdateRequest {
  type: RequestType
  args: string[]
  title?: string
}

export interface ParsedComponents {
  mandatory: UpdateRequest[]
  choice: UpdateRequest[]
}

export interface ParsedEffects {
  self: ParsedComponents
  target: ParsedComponents
}

// Socket Management Types
export interface SocketHandler<T extends unknown[], R> {
  (...args: T): R
}

// Event Processing Types
export interface ProcessingRights {
  canProcess: boolean
  gmUserId: string | null
}

export interface GMDelegationResult {
  isGM: boolean
  gmUserId: string | null
}