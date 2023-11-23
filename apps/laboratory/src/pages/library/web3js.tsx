import { Center, Text, VStack } from '@chakra-ui/react'
import { NetworksButton } from '../../components/NetworksButton'
import { createWeb3Modal, defaultConfig } from '@web3modal/web3js/react'
import { Web3jsConnectButton } from '../../components/Web3js/Web3jsConnectButton'
import { ThemeStore } from '../../utils/StoreUtil'
import {
  arbitrum,
  aurora,
  avalanche,
  base,
  binanceSmartChain,
  celo,
  gnosis,
  mainnet,
  optimism,
  polygon,
  zkSync,
  zora
} from '../../utils/ChainsUtil'

const projectId = process.env['NEXT_PUBLIC_PROJECT_ID']
if (!projectId) {
  throw new Error('NEXT_PUBLIC_PROJECT_ID is not set')
}
const chains = [
  mainnet,
  arbitrum,
  polygon,
  avalanche,
  binanceSmartChain,
  optimism,
  gnosis,
  zkSync,
  zora,
  base,
  celo,
  aurora
]

const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal Laboratory',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const modal = createWeb3Modal({
  web3Config: defaultConfig({
    metadata,
    defaultChainId: 1,
    rpcUrl: 'https://cloudflare-eth.com'
  }),
  chains,
  projectId,
  enableAnalytics: true,
  metadata
})

ThemeStore.setModal(modal)

export default function Web3js() {
  return (
    <>
      <Center paddingTop={10}>
        <Text fontSize="xl" fontWeight={700}>
          V3 with Web3js
        </Text>
      </Center>
      <Center h="65vh">
        <VStack gap={4}>
          <Web3jsConnectButton />
          <NetworksButton />
        </VStack>
      </Center>
    </>
  )
}
