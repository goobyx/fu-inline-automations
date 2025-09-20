import { ParsedComponents } from '../types/types.js'
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
  private static isInitialized = false

  static initialize(): void {
    if (this.isInitialized) return

    this.registerHooks()
    this.isInitialized = true
  }

  private static registerHooks(): void {
    Hooks.on(FUHooks.ATTACK_EVENT, this.handleAttackEvent.bind(this))
    Hooks.on(FUHooks.SKILL_EVENT, this.handleSkillEvent.bind(this))
    Hooks.on(FUHooks.SPELL_EVENT, this.handleSpellEvent.bind(this))
  }

  private static async handleAttackEvent(data: FUInlineAutomations.FUEventData): Promise<void> { await this.handleItemEvent(data) }
  private static async handleSkillEvent(data: FUInlineAutomations.FUEventData): Promise<void> { await this.handleItemEvent(data) }
  private static async handleSpellEvent(data: FUInlineAutomations.FUEventData): Promise<void> { await this.handleItemEvent(data) }

  private static async handleItemEvent(data: FUInlineAutomations.FUEventData): Promise<void> {
    try {
      const item = data.actor.items.getName(data.item.name) as game.ProjectFU.FUItem
      if (!item) {
        Logger.warn(`HookManager: Item '${data.item.name}' not found on actor '${data.actor.name}'`)
        return
      }
      
      if (!item.system?.description) return
      
      const effects = Parser.parseHtmlEffects(item.system.description)
      await this.processEffects(effects.self, data.actor, item, [data.actor])
      if (!data.targets || !Array.isArray(data.targets)) return
      await this.processEffects(effects.target, data.actor, item, data.targets.map(t => t.actor))
    } catch (error) {
      Logger.error(`HookManager: Failed to process item event for ${data.item.name}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  private static async processEffects(
    effects: ParsedComponents,
    sourceActor: game.ProjectFU.FUActor,
    item: game.ProjectFU.FUItem,
    targets: game.ProjectFU.FUActor[]
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

  static cleanup(): void {
    if (!this.isInitialized) return
    
    Hooks.off(FUHooks.ATTACK_EVENT, this.handleAttackEvent.bind(this))
    Hooks.off(FUHooks.SKILL_EVENT, this.handleSkillEvent.bind(this))
    Hooks.off(FUHooks.SPELL_EVENT, this.handleSpellEvent.bind(this))
    this.isInitialized = false
  }
}