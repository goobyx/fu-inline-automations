import { Logger } from './logger.js'

let socket: any = null
let isInitialized = false

export function initializeSocket(): void {
  if (isInitialized || typeof (globalThis as any).socketlib === 'undefined') return

  try {
    socket = (globalThis as any).socketlib.registerModule('fu-inline-automations')
    isInitialized = true
  } catch (error) { }
}

export function registerSocketHandler<T extends any[], R>(name: string, handler: (...args: T) => R): void {
  if (!socket) {
    Logger.error(`SocketManager: Cannot register handler '${name}' - socket not initialized`)
    return
  }

  try {
    socket.register(name, handler)
  } catch (error) { }
}

export async function executeAsUser<T extends any[], R>(handlerName: string, targetUserId: string, ...args: T): Promise<R> {
  if (!socket || !isInitialized) throw new Error(`SocketManager: Socket not available for cross-client execution - handler '${handlerName}'`)

  try {
    return await socket.executeAsUser(handlerName, targetUserId, ...args)
  } catch (error) {
    throw new Error(`SocketManager: Failed to execute '${handlerName}' for user ${targetUserId} - ${error}`)
  }
} 