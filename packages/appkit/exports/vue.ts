import { AppKit } from '../src/client.js'
import type { AppKitOptions } from '../src/utils/TypesUtil.js'
import { getWeb3Modal } from '../src/library/vue/index.js'
import packageJson from '../package.json' assert { type: 'json' }

// -- Views ------------------------------------------------------------
export * from '@reown/appkit-scaffold-ui'

// -- Hooks ------------------------------------------------------------
export * from '../src/library/vue/index.js'

// -- Utils & Other -----------------------------------------------------
export * from '../src/utils/index.js'
export type * from '@reown/appkit-core'
export type { CaipNetwork, CaipAddress, CaipNetworkId } from '@reown/appkit-common'
export { CoreHelperUtil, AccountController, NetworkController } from '@reown/appkit-core'

let modal: AppKit | undefined = undefined

type CreateWeb3Modal = Omit<AppKitOptions, 'sdkType' | 'sdkVersion'>

export function createWeb3Modal(options: CreateWeb3Modal) {
  if (!modal) {
    modal = new AppKit({
      ...options,
      sdkVersion: `vue-multichain-${packageJson.version}`
    })
    getWeb3Modal(modal)
  }

  return modal
}

export { AppKit }
export type { AppKitOptions }

// -- Hooks ------------------------------------------------------------
export * from '../src/library/vue/index.js'
