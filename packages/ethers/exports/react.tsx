'use client'

import type { Web3ModalOptions } from '../src/client.js'
import { Web3Modal } from '../src/client.js'
import { ConstantsUtil } from '@web3modal/utils'
import { ProviderController } from '../src/controllers/ProviderController.js'
import { getWeb3Modal } from '@web3modal/scaffold-react'
import { useSnapshot } from 'valtio'
import type { Eip1193Provider } from 'ethers'

// -- Types -------------------------------------------------------------------
export type { Web3ModalOptions } from '../src/client.js'

// -- Setup -------------------------------------------------------------------
let modal: Web3Modal | undefined = undefined

export function createWeb3Modal(options: Web3ModalOptions) {
  if (!modal) {
    modal = new Web3Modal({
      ...options,
      _sdkVersion: `react-ethers-${ConstantsUtil.VERSION}`
    })
  }
  getWeb3Modal(modal)

  return modal
}

// -- Hooks -------------------------------------------------------------------
export function useWeb3ModalProvider() {
  const state = useSnapshot(ProviderController.state)

  const walletProvider = state.provider as Eip1193Provider | undefined
  const walletProviderType = state.providerType

  return {
    walletProvider,
    walletProviderType
  }
}

export function useDisconnect() {
  async function disconnect() {
    await modal?.disconnect()
  }

  return {
    disconnect
  }
}

export function useWeb3ModalAccount() {
  const state = useSnapshot(ProviderController.state)

  const address = state.address
  const isConnected = state.isConnected
  const chainId = state.chainId

  return {
    address,
    isConnected,
    chainId
  }
}

export {
  useWeb3ModalTheme,
  useWeb3Modal,
  useWeb3ModalState,
  useWeb3ModalEvents
} from '@web3modal/scaffold-react'

// -- Universal Exports -------------------------------------------------------
export { defaultConfig } from '../src/utils/defaultConfig.js'
