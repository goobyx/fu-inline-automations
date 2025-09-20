/// <reference types="../../node_modules/fvtt-types/src/index.d.mts" />

import { ProcessingRights, GMDelegationResult } from '../types/types.js'

export class UserPriority {
  /**
   * Priority: user character > any player owner > GM (all must be online)
   * @param actor The actor to check ownership for
   * @returns User ID or undefined if no suitable user found
   */
  static determineOwnerUserId(actor: game.ProjectFU.FUActor): string | undefined {
    if (!actor) return undefined

    const currentUser = (game as any).user
    const users = (game as any).users?.contents || []

    for (const user of users) {
      if (user.character?.id === actor.id && !user.isGM && user.active) return user.id
    }

    const ownership = actor.ownership || {}
    for (const user of users) {
      if (user.isGM || !user.active) continue // Skip GMs and offline users

      const permission = ownership[user.id] || ownership.default || 0
      if (permission >= 3) return user.id
    }
    return currentUser?.id
  }

  static ownsAllTargets(targets: game.ProjectFU.FUActor[]): boolean {
    const currentUserId = (game as any).user?.id
    if (!currentUserId) return false

    return targets.every(target => {
      const ownership = target.ownership || {}
      const permission = ownership[currentUserId] || ownership.default || 0
      return permission >= 3
    })
  }

  static checkProcessingRights(targets?: game.ProjectFU.FUActor[]): ProcessingRights {
    const currentUserId = (game as any).user?.id
    const gmUserId = (game as any).users?.find((u: any) => u.isGM && u.active)?.id

    if (gmUserId && currentUserId === gmUserId) return { canProcess: true, gmUserId: null }
    if (targets && targets.length > 0 && this.ownsAllTargets(targets)) return { canProcess: true, gmUserId: null }
    if (gmUserId) return { canProcess: false, gmUserId }
    return { canProcess: true, gmUserId: null }
  }

  static checkGMDelegation(): GMDelegationResult {
    const currentUserId = (game as any).user?.id
    const gmUserId = (game as any).users?.find((u: any) => u.isGM && u.active)?.id
    if (gmUserId && currentUserId !== gmUserId) return { isGM: false, gmUserId }

    return { isGM: true, gmUserId: null }
  }
}
