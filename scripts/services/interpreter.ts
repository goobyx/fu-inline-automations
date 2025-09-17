import { UpdateRequest } from '../types/types.js'
import { RequestType } from '../types/enums.js'
import { Logger } from '../utilities/logger.js'
// @ts-ignore - ProjectFU system modules don't have type declarations
import { InlineSourceInfo } from 'projectfu/helpers/inline-helper.mjs'
// @ts-ignore - ProjectFU system modules don't have type declarations
import { ResourceRequest, ResourcePipeline } from 'projectfu/pipelines/resource-pipeline.mjs'
// @ts-ignore - ProjectFU system modules don't have type declarations
import { DamageRequest, DamagePipeline } from 'projectfu/pipelines/damage-pipeline.mjs'

export class Interpreter {
  
  static async process(request: UpdateRequest, source: game.ProjectFU.FUActor, item: game.ProjectFU.FUItem, targets: game.ProjectFU.FUActor[]): Promise<void> { 
    const handlers = new Map<RequestType, () => Promise<void>>([
      [RequestType.GAIN, () => this.processResource(request, source, item, targets)],
      [RequestType.LOSS, () => this.processResource(request, source, item, targets)],
      [RequestType.EFFECT, () => this.processEffect(request, source, item, targets)],
      [RequestType.DMG, () => this.processDamage(request, source, item, targets)]
    ])
    await handlers.get(request.type)?.()
  }
  
  // @GAIN[amount resource] or @LOSS[amount resource]
  private static async processResource(request: UpdateRequest, sourceActor: game.ProjectFU.FUActor, item: game.ProjectFU.FUItem, targets: game.ProjectFU.FUActor[]): Promise<void> {
    const amount = parseInt(request.args[0] || '0')
    const resourceType = request.args[1]?.toLowerCase()
    if (isNaN(amount) || !resourceType) return

    try {
      const sourceInfo = this.createSourceInfo(sourceActor, item)
      const r = new ResourceRequest(sourceInfo, targets, resourceType, amount)
      
      r.type === RequestType.GAIN ?
        await ResourcePipeline.processRecovery(r) :
        await ResourcePipeline.processLoss(r)
    } catch (error) {
      Logger.log(`Error processing resource effect: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // @EFFECT[uuid|status|base64]
  private static async processEffect(request: UpdateRequest, sourceActor: game.ProjectFU.FUActor, item: game.ProjectFU.FUItem, targets: game.ProjectFU.FUActor[]): Promise<void> {
    if (request.args.length !== 1) return
    const value = request.args[0]

    if (CONFIG.statusEffects.find(e => e.id === value)) {
      await this.addStatus(value, targets)
      return
    }

    // TODO: apply effects by uuid
  }

  // @DMG[amount type]
  private static async processDamage(request: UpdateRequest, sourceActor: game.ProjectFU.FUActor, item: game.ProjectFU.FUItem, targets: game.ProjectFU.FUActor[]): Promise<void> {
    if (request.args.length !== 2) return
    const amount = request.args[0]
    const type = request.args[1]

    const damageData = { type: type, total: amount, modifierTotal: 0 }
    const sourceInfo = this.createSourceInfo(sourceActor, item)
    sourceInfo.itemUuid = '' // avoid infinite loop by fetching and processing the description 
    const damageRequest = new DamageRequest(sourceInfo, targets, damageData)
    
    await DamagePipeline.process(damageRequest);
  }

  private static async addStatus(status: string, targets: game.ProjectFU.FUActor[]) {
    await Promise.all(targets.map(target => 
      target.toggleStatusEffect(status, { active: true })
    ))
  }

  private static createSourceInfo(sourceActor: any, item: any) {
    return new InlineSourceInfo(item.name, sourceActor.uuid, item.uuid, null)
  }
}
