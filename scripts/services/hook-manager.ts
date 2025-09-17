import { UpdateRequest } from '../types/types.js'
import { Logger } from '../utilities/logger.js'
import { Interpreter } from './interpreter.js'
import { Parser } from './parser.js'
import { EffectDialog } from '../ui/effect-dialog.js'
import { TextFormat } from '../utilities/text-format.js'
import { Chat } from '../utilities/chat.js'
import { UserPriority } from '../utilities/user-priority.js'
// @ts-ignore
import { FUHooks } from 'projectfu/hooks.mjs'


export class HookManager {
  private static instance: HookManager
  private isInitialized = false

  private constructor() { }

  static getInstance(): HookManager {
    if (!HookManager.instance) {
      HookManager.instance = new HookManager()
    }
    return HookManager.instance
  }

  initialize(): void {
    if (this.isInitialized) return

    this.registerDamagePipelineHooks()
    this.isInitialized = true
  }

  private registerDamagePipelineHooks(): void {
    Hooks.on(FUHooks.DAMAGE_PIPELINE_PRE_CALCULATE as any, this.handleDamagePipelinePreCalculate.bind(this))
  }

  private async handleDamagePipelinePreCalculate(data: any): Promise<void> {
    const effects = Parser.parseHtmlEffects(data.item.system.description)
    await this.processEffects(effects.self, data.sourceActor, data.item, [data.sourceActor])
    if (!data.targets || !Array.isArray(data.targets)) return
    await this.processEffects(effects.target, data.sourceActor, data.item, data.targets)
  }

  private async processEffects(
    effects: { mandatory: any[], choice: any[] },
    sourceActor: any,
    item: any,
    targets: any[]
  ): Promise<void> {
    await Promise.all(effects.mandatory.map(effect =>
      Interpreter.process(effect, sourceActor, item, targets)
    ))

    if (effects.choice.length > 0) {
      const userId = UserPriority.determineOwnerUserId(sourceActor)
      const selectedEffect = await EffectDialog.selectUpdateRequest(effects.choice, userId)
      if (!selectedEffect) return
      const message = `${sourceActor.name} applies ${TextFormat.formatUpdateRequest(selectedEffect)}`
      Chat.createDeferredMessage(sourceActor, message)
      await Interpreter.process(selectedEffect, sourceActor, item, targets)
    }
  }

  cleanup(): void {
    if (!this.isInitialized) return

    Hooks.off(FUHooks.DAMAGE_PIPELINE_PRE_CALCULATE as any, this.handleDamagePipelinePreCalculate.bind(this))
    this.isInitialized = false
  }
} 