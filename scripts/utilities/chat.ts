import { Logger } from './logger.js'

export class Chat {
  /**
   * Creates a chat message with deferred execution to avoid hook timing issues
   * @param actor The actor who is speaking
   * @param content The message content
   * @param delay Optional delay in milliseconds (default: 100)
   */
  static createDeferredMessage(actor: any, content: string, delay: number = 100): void {
    setTimeout(async () => {
      try {
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor }),
          content
        })
      } catch (error) {
        Logger.log(`Failed to create chat message: ${error}`)
      }
    }, delay)
  }
} 