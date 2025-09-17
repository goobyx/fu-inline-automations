// Global declaration for ProjectFU classes
declare global {
  // FU System Resource Management Classes
  class InlineSourceInfo {
    name: string
    actorUuid: string
    itemUuid: string
    effectUuid: any
    constructor(name: string, actorUuid: string, itemUuid: string, effectUuid: any)
  }

  class ResourceRequest {
    constructor(sourceInfo: InlineSourceInfo, targets: any[], resourceType: string, amount: number)
  }

  class ResourcePipeline {
    static processRecovery(request: ResourceRequest): Promise<void>
    static processLoss(request: ResourceRequest): Promise<void>
  }

  class DamageRequest {
    constructor(sourceInfo: InlineSourceInfo, targets: any[], damageData: any)
  }

  const DamagePipeline: {
    process(request: DamageRequest): Promise<void>
    initialize(): void
  }

  const FUHooks: {
    DAMAGE_PIPELINE_PRE_CALCULATE: string
    [key: string]: string
  }

  // Extend the game object to include ProjectFU types
  namespace game {
    const system: {
      id: string
      [key: string]: any
    }

    namespace ProjectFU {
      class FUActor extends Actor {
        // Add any specific FUActor properties/methods you need
      }

      class FUItem extends Item {
        // Add any specific FUItem properties/methods you need
      }
    }
  }
}

export {}