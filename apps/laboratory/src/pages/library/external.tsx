import { createWeb3Modal } from '@rerock/base/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { AppKitButtons } from '../../components/AppKitButtons'
import { WagmiTests } from '../../components/Wagmi/WagmiTests'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { WagmiModalInfo } from '../../components/Wagmi/WagmiModalInfo'
import { EVMWagmiClient } from '@rerock/appkit-adapter-wagmi'
import { arbitrum, mainnet, optimism, polygon, zkSync, sepolia } from '@rerock/base/chains'
import { externalTestConnector } from '../../utils/ConnectorUtil'

const queryClient = new QueryClient()

const connectors = [externalTestConnector()]
const networks = [mainnet, optimism, polygon, zkSync, arbitrum, sepolia]

const wagmiAdapter = new EVMWagmiClient({
  ssr: true,
  caipNetworks: networks,
  projectId: ConstantsUtil.ProjectId,
  connectors
})

const modal = createWeb3Modal({
  adapters: [wagmiAdapter],
  caipNetworks: networks,
  projectId: ConstantsUtil.ProjectId,
  features: {
    analytics: true
  },
  termsConditionsUrl: 'https://walletconnect.com/terms',
  privacyPolicyUrl: 'https://walletconnect.com/privacy'
})

ThemeStore.setModal(modal)

export default function Wagmi() {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppKitButtons />
        <WagmiModalInfo />
        <WagmiTests />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
