// @ts-ignore - ProjectFU system modules don't have type declarations
import { ResourceRequest, ResourcePipeline } from 'projectfu/pipelines/resource-pipeline.mjs'
// @ts-ignore - ProjectFU
import { ExpressionContext, Expressions } from 'projectfu/expressions/expressions.mjs'
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
  if (request.args.length < 2) return
  const resourceType = request.args[1]?.toLowerCase()

  try {
    const sourceInfo = createSourceInfo(sourceActor, item)
    const context = ExpressionContext.fromSourceInfo(sourceInfo, targets)
    const amount = await Expressions.evaluateAsync(request.args[0], context)
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
  const type = request.args[1]
  const sourceInfo = createSourceInfo(sourceActor, item)
  sourceInfo.itemUuid = ''
  const context = ExpressionContext.fromSourceInfo(sourceInfo, targets)
  const amount = Expressions.evaluateAsync(request.args[0], context)  // use expressions
  const damageData = { type, total: amount, modifierTotal: 0 }
  const damageRequest = new DamageRequest(sourceInfo, targets, damageData)

  await DamagePipeline.process(damageRequest)
}

async function processType(request: UpdateRequest, sourceActor: game.ProjectFU.FUActor, item: game.ProjectFU.FUItem, targets: game.ProjectFU.FUActor[]): Promise<void> {
  if (request.args.length < 2) return
  const type = request.args[0]
  await Promise.all(targets.map(target =>
    InlineType.onDropActor(target, undefined, {
      dataType: 'InlineType',
      sourceInfo: createSourceInfo(sourceActor, item),
      type,
      args: request.args.slice(1).join(' '),
      config: Parser.parseTypeConfig(request.args),
      ignore: undefined
    })
  ))
}

async function addStatus(status: string, targets: game.ProjectFU.FUActor[]): Promise<void> {
  await Promise.all(targets.map(target =>
    target.toggleStatusEffect(status, { active: true })
  ))
}

function createSourceInfo(sourceActor: game.ProjectFU.FUActor, item: game.ProjectFU.FUItem): InlineSourceInfo {
  return new InlineSourceInfo(item.name, sourceActor.uuid, item.uuid, null)
}

export const InlineAutomations = {
  processResource,
  processEffect,
  processDamage,
  processType,
  addStatus,
  createSourceInfo
}
