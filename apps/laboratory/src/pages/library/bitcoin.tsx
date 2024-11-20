import {
  createAppKit,
  useAppKitAccount,
  useAppKitProvider,
  type CaipNetwork
} from '@reown/appkit/react'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'

import { AppKitButtons } from '../../components/AppKitButtons'

import { BitcoinAdapter, type BitcoinProvider } from '@reown/appkit-adapter-bitcoin'
import { Button, Stack, useToast } from '@chakra-ui/react'
import { useState } from 'react'

const networks = ConstantsUtil.BitcoinNetworks

const bitcoinAdapter = new BitcoinAdapter({
  networks: networks as CaipNetwork[],
  projectId: ConstantsUtil.ProjectId
})

const appkit = createAppKit({
  adapters: [bitcoinAdapter],
  networks,
  projectId: ConstantsUtil.ProjectId,
  features: {
    analytics: true,
    email: false,
    socials: []
  },
  metadata: ConstantsUtil.Metadata,
  debug: true
})

ThemeStore.setModal(appkit)

export default function MultiChainBitcoinAdapterOnly() {
  const { walletProvider, walletProviderType } = useAppKitProvider<BitcoinProvider>('bip122')
  const { address } = useAppKitAccount()
  const [loading, setLoading] = useState(false)

  console.log('>> WALLET PROVIDER', walletProvider, walletProviderType)
  const toast = useToast()
  async function signMessage() {
    if (!walletProvider) {
      toast({
        title: 'No wallet provider',
        status: 'error',
        isClosable: true
      })

      return
    }

    setLoading(true)
    const signature = await walletProvider
      .signMessage({
        address,
        message: 'Hello, World!'
      })
      .catch((error: unknown) => {
        console.error('>> ERROR', error)
      })
      .finally(() => {
        setLoading(false)
      })

    toast({ title: 'Signature', description: signature, status: 'success' })
  }

  async function sendTransfer() {
    if (!walletProvider) {
      toast({
        title: 'No wallet provider',
        status: 'error',
        isClosable: true
      })
    }

    const signature = await walletProvider.sendTransfer({
      recipient: 'bc1qcer94ntpu33lcj0fnave79lu8tghkll47eeu9u',
      amount: '100000'
    })

    toast({
      title: `Transfer sent: ${signature}`,
      status: 'success',
      isClosable: true
    })
  }

  return (
    <>
      <AppKitButtons />
      {address && (
        <Stack direction={['column', 'column', 'row']} pt="8">
          <Button data-testid="sign-transaction-button" onClick={signMessage} isDisabled={loading}>
            Sign Message
          </Button>
          <Button data-testid="send-transfer-button" onClick={sendTransfer} isDisabled={loading}>
            Send Transfer
          </Button>
        </Stack>
      )}
    </>
  )
}
