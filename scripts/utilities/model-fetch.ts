import { Logger } from './logger.js'

export async function fetchRequestComponents(sourceUuid: string, itemId: string, targetUuids: string[]): Promise<{
  sourceActor: game.ProjectFU.FUActor | null,
  item: game.ProjectFU.FUItem | null,
  targets: game.ProjectFU.FUActor[]
}> {
  const sourceActor = await fromUuid(sourceUuid) as game.ProjectFU.FUActor
  if (!sourceActor) {
    Logger.error(`Failed to find source actor with UUID: ${sourceUuid}`)
    return { sourceActor: null, item: null, targets: [] }
  }

  const item = sourceActor.items.get(itemId) as game.ProjectFU.FUItem
  if (!item) {
    Logger.error(`Failed to find item with ID: ${itemId} on actor: ${sourceActor.name}`)
    return { sourceActor, item: null, targets: [] }
  }

  const targets: game.ProjectFU.FUActor[] = await Promise.all(targetUuids.map(async uuid => {
    const target = await fromUuid(uuid) as game.ProjectFU.FUActor
    if (target) return target
    Logger.warn(`Failed to find target actor with UUID: ${uuid}`)
    return null
  }))
  .then(results => results.filter(target => target !== null) as game.ProjectFU.FUActor[])

  return { sourceActor, item, targets }
} 