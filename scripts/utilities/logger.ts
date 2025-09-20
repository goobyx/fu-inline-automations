export class Logger {
  private static readonly PREFIX = '[FUFOL]'

  static log(message: string): void {
    console.log(`${this.PREFIX} ${message}`)
  }

  static warn(message: string): void {
    console.warn(`${this.PREFIX} ${message}`)
  }

  static error(message: string): void {
    console.error(`${this.PREFIX} ${message}`)
  }

  static debug(message: string): void {
    console.debug(`${this.PREFIX} ${message}`)
  }
}
