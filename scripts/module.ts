/// <reference types="../node_modules/fvtt-types/src/index.d.mts" />
/// <reference path="types/project-fu.d.ts" />

import { Logger } from './utilities/logger.js'
import { HookManager } from './services/hook-manager.js'
import { EffectDialog } from './ui/effect-dialog.js'

Hooks.once('socketlib.ready' as any, () => {
  EffectDialog.initializeSocket()
})

Hooks.once('ready', async function() {
  if (game.system?.id !== 'projectfu') return

  if (typeof (globalThis as any).socketlib !== 'undefined') {
    EffectDialog.initializeSocket()
  }

  const hookManager = HookManager.getInstance()
  hookManager.initialize()
})