/// <reference types="../node_modules/fvtt-types/src/index.d.mts" />
/// <reference path="types/project-fu.d.ts" />

import { Logger } from './utilities/logger.js'
import { HookManager } from './services/hook-manager.js'

Hooks.once('ready', async function() {
  if (game.system?.id !== 'projectfu') return

  const hookManager = HookManager.getInstance()
  hookManager.initialize()
})