export class UserPriority {
  /**
   * Determines the appropriate user ID to show the dialog to based on actor ownership
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
} 