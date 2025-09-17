import { UpdateRequest } from '../types/types.js'
import { TextFormat } from '../utilities/text-format.js'
import { Logger } from '../utilities/logger.js'

// Socket instance for cross-client communication
let socket: any

export class EffectDialog {
  /**
   * Initialize socketlib for cross-client communication
   */
  static initializeSocket(): void {
    if (typeof (globalThis as any).socketlib !== 'undefined') {
      try {
        socket = (globalThis as any).socketlib.registerModule('fu-inline-automations')
        socket.register('showEffectDialog', (requests: UpdateRequest[]) => EffectDialog.showDialogForUser(requests))
      } catch (error) {
        Logger.error('EffectDialog: Failed to initialize socket')
      }
    }
  }

  /**
   * Renders a dialog with radio buttons for selecting from UpdateRequest options
   * @param requests Array of UpdateRequest objects to choose from
   * @param targetUserId Optional user ID to show the dialog to (defaults to current user)
   * @returns Promise that resolves to the selected UpdateRequest or undefined if dialog is closed
   */
  static async selectUpdateRequest(requests: UpdateRequest[], targetUserId?: string): Promise<UpdateRequest | undefined> {
    if (requests.length === 0) {
      throw new Error('No requests provided')
    }

    if (requests.length === 1) {
      return requests[0]
    }

    const currentUserId = (game as any).user?.id

    // If we need to show the dialog to a different user, use socket communication
    if (targetUserId && targetUserId !== currentUserId) {
      if (socket) {
        try {
          return await socket.executeAsUser('showEffectDialog', targetUserId, requests)
        } catch (error) {
          console.error('Failed to execute socket command:', error)
          return undefined
        }
      } else {
        console.warn('Socket not available, showing dialog locally instead')
      }
    }

    // Generate radio button HTML for each request
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
      
      // Handle dialog close event
      dialog.addEventListener('close', () => resolve(undefined))
      dialog.render({ force: true })
    })
  }

  /**
   * Show dialog for a specific user (called via socketlib)
   * @param requests Array of UpdateRequest objects to choose from
   * @returns Promise that resolves to the selected UpdateRequest or undefined
   */
  static async showDialogForUser(requests: UpdateRequest[]): Promise<UpdateRequest | undefined> {
    return EffectDialog.selectUpdateRequest(requests)
  }
}
