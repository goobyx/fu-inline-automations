// @ts-ignore - ProjectFU system modules don't have type declarations
import { ResourceRequest, ResourcePipeline } from 'projectfu/pipelines/resource-pipeline.mjs'
// @ts-ignore - ProjectFU 
import { DamageRequest, DamagePipeline } from 'projectfu/pipelines/damage-pipeline.mjs'
// @ts-ignore - ProjectFU 
import { InlineSourceInfo } from 'projectfu/helpers/inline-helper.mjs'
// @ts-ignore - ProjectFU 
import { InlineType } from 'projectfu/helpers/inline-type.mjs'
import { UpdateRequest } from '../types/types.js'
import { RequestType } from '../types/enums.js'
import { Logger } from '../utilities/logger.js'
import { Parser } from './parser.js'

// @GAIN[amount resource] or @LOSS[amount resource]
async function processResource(request: UpdateRequest, sourceActor: game.ProjectFU.FUActor, item: game.ProjectFU.FUItem, targets: game.ProjectFU.FUActor[]): Promise<void> {
  const amount = parseInt(request.args[0] || '0')
  const resourceType = request.args[1]?.toLowerCase()
  if (isNaN(amount) || !resourceType) return

  try {
    const sourceInfo = createSourceInfo(sourceActor, item)
    const r = new ResourceRequest(sourceInfo, targets, resourceType, amount)
    request.type === RequestType.GAIN ?
      await ResourcePipeline.processRecovery(r) :
      await ResourcePipeline.processLoss(r)
  } catch (error) {
    Logger.log(`Error processing resource effect: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// @EFFECT[uuid|status|base64]
async function processEffect(request: UpdateRequest, sourceActor: game.ProjectFU.FUActor, item: game.ProjectFU.FUItem, targets: game.ProjectFU.FUActor[]): Promise<void> {
  if (request.args.length !== 1) return
  const value = request.args[0]

  if (CONFIG.statusEffects.find(e => e.id === value)) {
    await addStatus(value, targets)
    return
  }
  // TODO: apply effects by uuid
}

// @DMG[amount type]
async function processDamage(request: UpdateRequest, sourceActor: game.ProjectFU.FUActor, item: game.ProjectFU.FUItem, targets: game.ProjectFU.FUActor[]): Promise<void> {
  if (request.args.length !== 2) return
  const amount = request.args[0]
  const type = request.args[1]

  const damageData = { type: type, total: amount, modifierTotal: 0 }
  const sourceInfo = createSourceInfo(sourceActor, item)
  sourceInfo.itemUuid = ''
  const damageRequest = new DamageRequest(sourceInfo, targets, damageData)
  
  await DamagePipeline.process(damageRequest);
}

async function processType(request: UpdateRequest, sourceActor: game.ProjectFU.FUActor, item: game.ProjectFU.FUItem, targets: game.ProjectFU.FUActor[]): Promise<void> {
  if (request.args.length < 2) return
  const type = request.args[0]
  await Promise.all(targets.map(target =>
    InlineType.onDropActor(target, undefined, {
      dataType: 'InlineType',
      sourceInfo: createSourceInfo(sourceActor, item),
      type: type,
      args: request.args.slice(1).join(' '),
      config: Parser.parseTypeConfig(request.args),
      ignore: undefined
    })
  ))
}

async function addStatus(status: string, targets: game.ProjectFU.FUActor[]) {
  await Promise.all(targets.map(target => 
    target.toggleStatusEffect(status, { active: true })
  ))
}

function createSourceInfo(sourceActor: game.ProjectFU.FUActor, item: game.ProjectFU.FUItem) {
  return new InlineSourceInfo(item.name, sourceActor.uuid, item.uuid, null)
}

// Export the main functions as InlineAutomations object
export const InlineAutomations = {
  processResource,
  processEffect,
  processDamage,
  processType,
  addStatus,
  createSourceInfo
} 