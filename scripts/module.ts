/// <reference types="../node_modules/fvtt-types/src/index.d.mts" />
/// <reference path="types/project-fu.d.ts" />

import { HookManager } from './services/hook-manager.js'
import { EffectDialog } from './ui/effect-dialog.js'
import { Interpreter } from './services/interpreter.js'
import { initializeSocket, registerSocketHandler } from './utilities/socket-management.js'
import { UpdateRequest } from './types/types.js'

function setupSocket() {
  initializeSocket()
  registerSocketHandler('showEffectDialog', (requests: UpdateRequest[]) => EffectDialog.showDialogForUser(requests) )
  registerSocketHandler('processEffect', (request: UpdateRequest, sourceUuid: string, itemId: string, targetUuids: string[]) => 
    Interpreter.processEffectAsGM(request, sourceUuid, itemId, targetUuids)
  )
}

Hooks.once('socketlib.ready' as any, () => {
  setupSocket()
})

Hooks.once('ready', async function() {
  if (game.system?.id !== 'projectfu') return
  HookManager.initialize()
})