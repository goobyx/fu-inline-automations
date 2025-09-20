// Additional types not covered by fvtt-types
declare global {
  interface SocketLib {
    registerModule(moduleName: string): SocketLibSocket
  }

  interface SocketLibSocket {
    register<T extends unknown[], R>(name: string, handler: (...args: T) => R): void
    executeAsUser<T extends unknown[], R>(handlerName: string, targetUserId: string, ...args: T): Promise<R>
  }

  interface GlobalThis {
    socketlib?: SocketLib
  }
}

export {}
