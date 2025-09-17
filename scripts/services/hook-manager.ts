import { UpdateRequest } from '../types/types.js'
import { Logger } from '../utilities/logger.js'
import { Interpreter } from './interpreter.js'
import { Parser } from './parser.js'
import { EffectDialog } from '../ui/effect-dialog.js'
import { TextFormat } from '../utilities/text-format.js'
import { Chat } from '../utilities/chat.js'
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

    await Promise.all(effects.self.mandatory.map(effect =>
      Interpreter.process(effect, data.sourceActor, data.item, [data.sourceActor])
    ))
    if (effects.self.choice.length > 0) {
      const selectedEffect = await EffectDialog.selectUpdateRequest(effects.self.choice)
      if (selectedEffect) {
        const message = `${data.sourceActor.name} applies ${TextFormat.formatUpdateRequest(selectedEffect)}`
        Chat.createDeferredMessage(data.sourceActor, message)
        await Interpreter.process(selectedEffect, data.sourceActor, data.item, [data.sourceActor])
      }
    }

    if (!data.targets || !Array.isArray(data.targets)) return
    
    await Promise.all(effects.target.mandatory.map(effect =>
      Interpreter.process(effect, data.sourceActor, data.item, data.targets)
    ))
    if (effects.target.choice.length > 0) {
      const selectedEffect = await EffectDialog.selectUpdateRequest(effects.target.choice)
      if (selectedEffect) {
        const message = `${data.sourceActor.name} applies ${TextFormat.formatUpdateRequest(selectedEffect)}`
        Chat.createDeferredMessage(data.sourceActor, message)
        await Interpreter.process(selectedEffect, data.sourceActor, data.item, data.targets)
      }
    }
  }

  cleanup(): void {
    if (!this.isInitialized) return

    Hooks.off(FUHooks.DAMAGE_PIPELINE_PRE_CALCULATE as any, this.handleDamagePipelinePreCalculate.bind(this))
    this.isInitialized = false
  }
} 