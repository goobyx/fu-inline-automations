// Global declaration for ProjectFU classes
declare global {
  namespace FUInlineAutomations {
    interface FUEventData {
      actor: game.ProjectFU.FUActor
      item: game.ProjectFU.FUItem
      targets?: game.ProjectFU.FUActor[]
      sourceActor?: game.ProjectFU.FUActor
    }
  }

  class InlineSourceInfo {
    name: string
    actorUuid: string
    itemUuid: string
    effectUuid: string | null
    constructor(name: string, actorUuid: string, itemUuid: string, effectUuid: string | null)
  }

  class ResourceRequest {
    constructor(sourceInfo: InlineSourceInfo, targets: game.ProjectFU.FUActor[], resourceType: string, amount: number)
  }

  class ResourcePipeline {
    static processRecovery(request: ResourceRequest): Promise<void>
    static processLoss(request: ResourceRequest): Promise<void>
  }

  interface DamageData {
    type?: string
    amount?: number
    [key: string]: unknown
  }

  class DamageRequest {
    constructor(sourceInfo: InlineSourceInfo, targets: game.ProjectFU.FUActor[], damageData: DamageData)
  }

  const DamagePipeline: {
    process(request: DamageRequest): Promise<void>
    initialize(): void
  }

  const FUHooks: {
    SKILL_EVENT: string
    SPELL_EVENT: string
    DAMAGE_PIPELINE_POST_CALCULATE: string // preffered because it has the rolled item
    [key: string]: string
  }

  interface InlineDurationConfig {
    event?: string
    interval?: number
    tracking?: string
    [key: string]: unknown
  }

  namespace game {
    const system: {
      id: string
      [key: string]: unknown
    }

    namespace ProjectFU {
      interface FUActor extends Actor { }

      interface FUItem extends Item {
        name: string
        system: {
          description?: string
          [key: string]: unknown
        }
      }
    }
  }
}

export {}
