import type { ChainAdapter } from '@web3modal/core'
import type { AppKitOptions } from '../../utils/index.js'
import { mainnet, solana } from '../../chains/index.js'
import type { SdkVersion } from '@web3modal/core'

export const mockOptions = {
  projectId: 'test-project-id',
  adapters: [{ chainNamespace: 'eip155' } as unknown as ChainAdapter],
  caipNetworks: [mainnet, solana],
  metadata: {
    name: 'Test App',
    description: 'Test App Description',
    url: 'https://test-app.com',
    icons: ['https://test-app.com/icon.png']
  },
  sdkVersion: `html-wagmi-5.1.6` as SdkVersion
} as unknown as AppKitOptions & {
  sdkVersion: SdkVersion
}
