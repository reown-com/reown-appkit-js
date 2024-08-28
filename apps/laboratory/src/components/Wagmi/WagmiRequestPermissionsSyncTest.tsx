import { Button, Stack, Text } from '@chakra-ui/react'
import { useAccount } from 'wagmi'
import { walletActionsErc7715 } from 'viem/experimental'
import { useCallback, useState } from 'react'
import { useChakraToast } from '../Toast'
import { createWalletClient, custom, type Chain } from 'viem'
import { EIP_7715_RPC_METHODS } from '../../utils/EIP5792Utils'
import { usePasskey } from '../../context/PasskeyContext'
import {
  useWagmiAvailableCapabilities,
  type Provider
} from '../../hooks/useWagmiActiveCapabilities'

import { useERC7715Permissions } from '../../hooks/useERC7715Permissions'
import { bigIntReplacer } from '../../utils/CommonUtils'

export function WagmiRequestPermissionsSyncTest() {
  const { provider, supported } = useWagmiAvailableCapabilities({
    method: EIP_7715_RPC_METHODS.WALLET_GRANT_PERMISSIONS
  })
  const { chain, address, isConnected } = useAccount()

  if (!isConnected || !provider || !address || !chain) {
    return (
      <Text fontSize="md" color="yellow">
        Wallet not connected
      </Text>
    )
  }
  if (!supported) {
    return (
      <Text fontSize="md" color="yellow">
        Wallet does not support wallet_grantPermissions rpc method
      </Text>
    )
  }

  return <ConnectedTestContent chain={chain} provider={provider} />
}

function ConnectedTestContent({ chain, provider }: { chain: Chain; provider: Provider }) {
  const [isRequestPermissionLoading, setRequestPermissionLoading] = useState<boolean>(false)
  const { passkey } = usePasskey()
  const { grantedPermissions, clearGrantedPermissions, requestPermissionsSync } =
    useERC7715Permissions({ chain })

  const toast = useChakraToast()

  const onRequestPermissions = useCallback(async () => {
    setRequestPermissionLoading(true)

    if (!passkey) {
      throw new Error('Passkey not available')
    }
    if (!provider) {
      throw new Error('No Provider available, Please connect your wallet.')
    }

    const walletClient = createWalletClient({
      chain,
      transport: custom(provider)
    }).extend(walletActionsErc7715())

    const response = await requestPermissionsSync(walletClient, passkey)
    if ('error' in response) {
      toast({
        type: 'error',
        title: 'Request Permissions Errors',
        description: response.message
      })
      setRequestPermissionLoading(false)

      return
    }
    toast({
      type: 'success',
      title: 'Permissions Granted',
      description: JSON.stringify(response.approvedPermissions, bigIntReplacer)
    })

    setRequestPermissionLoading(false)
  }, [passkey, provider])

  return (
    <Stack direction={['column', 'column', 'row']}>
      <Button
        data-testid="request-permissions-button"
        onClick={onRequestPermissions}
        isDisabled={Boolean(isRequestPermissionLoading || Boolean(grantedPermissions))}
        isLoading={isRequestPermissionLoading}
      >
        Request Permissions
      </Button>
      <Button
        data-test-id="clear-permissions-button"
        onClick={clearGrantedPermissions}
        isDisabled={!grantedPermissions}
      >
        Clear Permissions
      </Button>
    </Stack>
  )
}
