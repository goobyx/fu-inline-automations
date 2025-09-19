import { UpdateRequest } from '../types/types.js'
import { TextFormat } from '../utilities/text-format.js'
import { Logger } from '../utilities/logger.js'

// Socket instance for cross-client communication
let socket: any

export class EffectDialog {
  static initializeSocket(): void {
    if (typeof (globalThis as any).socketlib === 'undefined') return

    try {
      socket = (globalThis as any).socketlib.registerModule('fu-inline-automations')
      socket.register('showEffectDialog', (requests: UpdateRequest[]) => EffectDialog.showDialogForUser(requests))
    } catch (error) {
      Logger.error('EffectDialog: Failed to initialize socket')
    }
  }

  static async selectUpdateRequest(requests: UpdateRequest[], targetUserId?: string): Promise<UpdateRequest | undefined> {
    if (requests.length === 0) {
      throw new Error('No requests provided')
    }

    if (requests.length === 1) {
      return requests[0]
    }

    const currentUserId = (game as any).user?.id

    if (targetUserId && targetUserId !== currentUserId) {
      return this.handleCrossClientDialog(requests, targetUserId)
    }

    const radioButtons = requests.map((request, index) => {
      const checked = index === 0 ? 'checked' : ''
      return `<label><input type="radio" name="choice" value="${index}" ${checked}> ${TextFormat.formatUpdateRequest(request)}</label>`
    }).join('<br>')

    return new Promise((resolve) => {
      const dialog = new foundry.applications.api.DialogV2({
        window: { title: requests[0].title || "Choose an effect" },
        content: radioButtons,
        buttons: [{
          action: "choice",
          label: "Apply Effect",
          default: true,
          callback: (event, button, dialog) => {
            const formData = new FormData(button.form!)
            return formData.get('choice')
          }
        }],
        submit: async (result) => {
          if (result !== null && result !== undefined) {
            const selectedIndex = parseInt(result as string)
            if (selectedIndex >= 0 && selectedIndex < requests.length) {
              resolve(requests[selectedIndex])
            } else {
              resolve(undefined)
            }
          } else {
            resolve(undefined)
          }
        }
      })
      
      dialog.addEventListener('close', () => resolve(undefined))
      dialog.render({ force: true })
    })
  }

  private static async handleCrossClientDialog(requests: UpdateRequest[], targetUserId: string): Promise<UpdateRequest | undefined> {
    if (!socket) {
      Logger.warn('Socket not available, showing dialog locally instead')
      return this.selectUpdateRequest(requests)
    }

    try {
      return await socket.executeAsUser('showEffectDialog', targetUserId, requests)
    } catch (error) {
      Logger.error('Failed to execute socket command: ' + error)
      return undefined
    }
  }

  static async showDialogForUser(requests: UpdateRequest[]): Promise<UpdateRequest | undefined> {
    return EffectDialog.selectUpdateRequest(requests)
  }
}
