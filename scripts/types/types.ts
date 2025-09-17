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