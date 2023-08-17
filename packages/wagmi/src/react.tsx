'use client'

import type { ThemeMode, ThemeVariables } from '@web3modal/scaffold'
import type { Web3ModalOptions } from './client.js'
import { Web3Modal } from './client.js'
import { VERSION } from './utils/constants.js'

// -- Types -------------------------------------------------------------------
export type { Web3ModalOptions } from './client.js'
type OpenOptions = Parameters<Web3Modal['open']>[0]

// -- Setup -------------------------------------------------------------------
let modal: Web3Modal | undefined = undefined

// -- Lib ---------------------------------------------------------------------
export function createWeb3Modal(options: Omit<Web3ModalOptions, '_sdkVersion'>) {
  if (!modal) {
    modal = new Web3Modal({ ...options, _sdkVersion: `react-wagmi-${VERSION}` })
  }

  return modal
}

export function useWeb3Modal() {
  if (!modal) {
    throw new Error('Please call "createWeb3Modal" before using "useWeb3Modal" hook')
  }

  async function open(options?: OpenOptions) {
    await modal?.open(options)
  }

  async function close() {
    await modal?.close()
  }

  function setThemeMode(themeMode: ThemeMode) {
    modal?.setThemeMode(themeMode)
  }

  function setThemeVariables(themeVariables: ThemeVariables) {
    modal?.setThemeVariables(themeVariables)
  }

  const themeMode = modal?.getThemeMode()

  const themeVariables = modal?.getThemeVariables()

  return { open, close, themeMode, themeVariables, setThemeMode, setThemeVariables }
}
