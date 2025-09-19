import { UpdateRequest } from '../types/types.js'
import { RequestType } from '../types/enums.js'
import { Logger } from '../utilities/logger.js'
import { executeAsUser } from '../utilities/socket-management.js'
import { UserPriority } from '../utilities/user-priority.js'
import { fetchRequestComponents } from '../utilities/model-fetch.js'
import { InlineAutomations } from './inline-automations.js'

export class Interpreter {
  
  static async executeHandler(request: UpdateRequest, source: game.ProjectFU.FUActor, item: game.ProjectFU.FUItem, targets: game.ProjectFU.FUActor[]): Promise<void> {
    const handlers = new Map<RequestType, () => Promise<void>>([
      [RequestType.GAIN, () => InlineAutomations.processResource(request, source, item, targets)],
      [RequestType.LOSS, () => InlineAutomations.processResource(request, source, item, targets)],
      [RequestType.EFFECT, () => InlineAutomations.processEffect(request, source, item, targets)],
      [RequestType.DMG, () => InlineAutomations.processDamage(request, source, item, targets)],
      [RequestType.TYPE, () => InlineAutomations.processType(request, source, item, targets)]
    ])
    await handlers.get(request.type)?.()
  }

  static async process(request: UpdateRequest, source: game.ProjectFU.FUActor, item: game.ProjectFU.FUItem, targets: game.ProjectFU.FUActor[]): Promise<void> { 
    const processingCheck = UserPriority.checkProcessingRights(targets)
    
    if (!processingCheck.canProcess) {
      try {
        await executeAsUser('processEffect', processingCheck.gmUserId, request, source.uuid, item.id, targets.map(t => t.uuid))
        return
      } catch (error) {
        Logger.warn('Failed to send effect to GM for processing, processing locally: ' + error)
      }
    }

    await this.executeHandler(request, source, item, targets)
  }
  
  // smaller params for socket efficiency
  static async processEffectAsGM(request: UpdateRequest, sourceUuid: string, itemId: string, targetUuids: string[]): Promise<void> {
    try {
      const { sourceActor, item, targets } = await fetchRequestComponents(sourceUuid, itemId, targetUuids)
      if (!sourceActor || !item) return

      await this.executeHandler(request, sourceActor, item, targets)
      } catch (error) {
      Logger.error(`Failed to process effect as GM: ${error}`)
    }
  }
}
