import { AdapterBlueprint } from '@reown/appkit/adapters'
import {
  ConstantsUtil as CommonConstantsUtil,
  type CaipNetwork,
  type ChainNamespace
} from '@reown/appkit-common'
import {
  AlertController,
  CoreHelperUtil,
  EventsController,
  type ConnectorType,
  type Provider
} from '@reown/appkit-core'
import { ConstantsUtil, ErrorUtil } from '@reown/appkit-utils'
import { Connection, PublicKey } from '@solana/web3.js'
import type { Commitment, ConnectionConfig } from '@solana/web3.js'
import { SolConstantsUtil } from '@reown/appkit-utils/solana'
import { SolStoreUtil } from './utils/SolanaStoreUtil.js'
import { watchStandard } from './utils/watchStandard.js'
import { AuthProvider } from './providers/AuthProvider.js'
import {
  CoinbaseWalletProvider,
  type SolanaCoinbaseWallet
} from './providers/CoinbaseWalletProvider.js'
import type { W3mFrameProvider } from '@reown/appkit-wallet'
import { WcHelpersUtil, type AppKit, type AppKitOptions } from '@reown/appkit'
import { W3mFrameProviderSingleton } from '@reown/appkit/auth-provider'
import { withSolanaNamespace } from './utils/withSolanaNamespace.js'
import UniversalProvider from '@walletconnect/universal-provider'
import { createSendTransaction } from './utils/createSendTransaction.js'
import type { WalletStandardProvider } from './providers/WalletStandardProvider.js'

export interface AdapterOptions {
  connectionSettings?: Commitment | ConnectionConfig
}

export class SolanaAdapter extends AdapterBlueprint {
  private connectionSettings: Commitment | ConnectionConfig
  private w3mFrameProvider?: W3mFrameProvider
  private authProvider?: AuthProvider
  private authSession?: AuthProvider.Session

  constructor(options: AdapterOptions = {}) {
    super({})
    this.namespace = CommonConstantsUtil.CHAIN.SOLANA
    this.connectionSettings = options.connectionSettings || 'confirmed'

    EventsController.subscribe(state => {
      if (state.data.event === 'SELECT_WALLET') {
        const isMobile = CoreHelperUtil.isMobile()
        const isClient = CoreHelperUtil.isClient()

        if (isMobile && isClient) {
          if (state.data.properties?.name === 'Phantom' && !('phantom' in window)) {
            const href = window.location.href
            const protocol = href.startsWith('https') ? 'https' : 'http'
            const host = href.split('/')[2]
            const ref = `${protocol}://${host}`
            window.location.href = `https://phantom.app/ul/browse/${href}?ref=${ref}`
          }

          if (state.data.properties?.name === 'Coinbase Wallet' && !('coinbaseSolana' in window)) {
            const href = window.location.href
            window.location.href = `https://go.cb-w.com/dapp?cb_url=${href}`
          }
        }
      }
    })
  }

  public syncConnectors(options: AppKitOptions, appKit: AppKit) {
    if (!options.projectId) {
      throw new Error('projectId is required')
    }

    // Initialize Auth Provider if email/socials enabled
    const emailEnabled = options.features?.email !== false
    const socialsEnabled =
      options.features?.socials !== false &&
      Array.isArray(options.features?.socials) &&
      options.features.socials.length > 0

    if (emailEnabled || socialsEnabled) {
      this.w3mFrameProvider = W3mFrameProviderSingleton.getInstance({
        projectId: options.projectId,
        chainId: withSolanaNamespace(appKit?.getCaipNetwork(this.namespace)?.id),
        onTimeout: () => {
          AlertController.open(ErrorUtil.ALERT_ERRORS.INVALID_APP_CONFIGURATION_SOCIALS, 'error')
        }
      })

      this.authProvider = new AuthProvider({
        getProvider: () => this.w3mFrameProvider as W3mFrameProvider,
        getActiveChain: () => appKit.getCaipNetwork(this.namespace),
        getActiveNamespace: () => appKit.getActiveChainNamespace(),
        getSession: () => this.authSession,
        setSession: session => {
          this.authSession = session
        },
        chains: this.caipNetworks as CaipNetwork[]
      })

      this.addConnector({
        id: ConstantsUtil.AUTH_CONNECTOR_ID,
        type: 'AUTH',
        provider: this.authProvider as unknown as W3mFrameProvider,
        name: 'Auth',
        chain: this.namespace as ChainNamespace,
        chains: []
      })
    }

    // Add Coinbase Wallet if available
    if ('coinbaseSolana' in window) {
      this.addConnector({
        id: 'coinbaseWallet',
        type: 'EXTERNAL',
        // @ts-expect-error window.coinbaseSolana exists
        provider: new CoinbaseWalletProvider({
          provider: window.coinbaseSolana as SolanaCoinbaseWallet,
          chains: this.caipNetworks as CaipNetwork[],
          getActiveChain: () => appKit.getCaipNetwork(this.namespace) as CaipNetwork
        }),
        name: 'Coinbase Wallet',
        chain: this.namespace as ChainNamespace,
        chains: []
      })
    }

    // Watch for standard wallet adapters
    watchStandard(
      this.caipNetworks as CaipNetwork[],
      () => appKit.getCaipNetwork(this.namespace),
      (...providers: WalletStandardProvider[]) => {
        providers.forEach(provider => {
          this.addConnector({
            id: provider.name,
            type: 'ANNOUNCED',
            provider: provider as unknown as Provider,
            imageUrl: provider.icon,
            name: provider.name,
            chain: CommonConstantsUtil.CHAIN.SOLANA,
            chains: []
          })
        })
      }
    )
  }

  // -- Transaction methods ---------------------------------------------------
  /**
   *
   * These methods are supported only on `wagmi` and `ethers` since the Solana SDK does not support them in the same way.
   * These function definition is to have a type parity between the clients. Currently not in use.
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  public async getEnsAddress(
    params: AdapterBlueprint.GetEnsAddressParams
  ): Promise<AdapterBlueprint.GetEnsAddressResult> {
    return { address: params.name }
  }

  public async writeContract(): Promise<AdapterBlueprint.WriteContractResult> {
    return Promise.resolve({
      hash: ''
    })
  }

  public async signMessage(
    params: AdapterBlueprint.SignMessageParams
  ): Promise<AdapterBlueprint.SignMessageResult> {
    const walletStandardProvider = params.provider as unknown as WalletStandardProvider
    if (!walletStandardProvider) {
      throw new Error('connectionControllerClient:signMessage - provider is undefined')
    }

    const signature = await walletStandardProvider.signMessage(
      new TextEncoder().encode(params.message)
    )

    return {
      signature: new TextDecoder().decode(signature)
    }
  }

  public async estimateGas(
    params: AdapterBlueprint.EstimateGasTransactionArgs
  ): Promise<AdapterBlueprint.EstimateGasTransactionResult> {
    const connection = SolStoreUtil.state.connection

    if (!connection || !params.provider) {
      throw new Error('Connection is not set')
    }

    const transaction = await createSendTransaction({
      provider: params.provider as unknown as WalletStandardProvider,
      connection,
      to: '11111111111111111111111111111111',
      value: 1
    })

    const fee = await transaction.getEstimatedFee(connection)

    return {
      gas: BigInt(fee || 0)
    }
  }

  public async sendTransaction(
    params: AdapterBlueprint.SendTransactionParams
  ): Promise<AdapterBlueprint.SendTransactionResult> {
    const connection = SolStoreUtil.state.connection

    if (!connection || !params.address || !params.provider) {
      throw new Error('Connection is not set')
    }

    const walletStandardProvider = params.provider as unknown as WalletStandardProvider

    const transaction = await createSendTransaction({
      provider: walletStandardProvider,
      connection,
      to: params.to,
      value: params.value as number
    })

    const result = await walletStandardProvider.sendTransaction(transaction, connection)

    await new Promise<void>(resolve => {
      const interval = setInterval(async () => {
        const status = await connection.getSignatureStatus(result)

        if (status?.value) {
          clearInterval(interval)
          resolve()
        }
      }, 1000)
    })

    return {
      hash: result
    }
  }

  public parseUnits(): bigint {
    return 0n
  }

  public formatUnits(): string {
    return ''
  }

  public async connect(
    params: AdapterBlueprint.ConnectParams
  ): Promise<AdapterBlueprint.ConnectResult> {
    const { id, type, rpcUrl } = params

    const selectedProvider = this.connectors.find(c => c.id === id)?.provider as Provider

    if (!selectedProvider) {
      throw new Error('Provider not found')
    }

    // eslint-disable-next-line init-declarations
    let address: string

    if (type === 'AUTH') {
      const data = await this.authProvider?.connect()

      if (!data) {
        throw new Error('No address found')
      }

      address = data
    } else {
      address = await selectedProvider.connect()
    }

    this.listenProviderEvents(selectedProvider)

    SolStoreUtil.setConnection(new Connection(rpcUrl as string, 'confirmed'))

    return {
      address,
      chainId: params.chainId,
      provider: selectedProvider,
      type: type as ConnectorType,
      id
    }
  }

  public async getBalance(
    params: AdapterBlueprint.GetBalanceParams
  ): Promise<AdapterBlueprint.GetBalanceResult> {
    const connection = new Connection(
      params.caipNetwork?.rpcUrls?.default?.http?.[0] as string,
      this.connectionSettings
    )
    const balance = await connection.getBalance(new PublicKey(params.address))
    const formattedBalance = (balance / SolConstantsUtil.LAMPORTS_PER_SOL).toString()

    if (!params.caipNetwork) {
      throw new Error('caipNetwork is required')
    }

    return {
      balance: formattedBalance,
      symbol: params.caipNetwork?.nativeCurrency.symbol
    }
  }

  public async switchNetwork(params: AdapterBlueprint.SwitchNetworkParams): Promise<void> {
    const { caipNetwork, provider, providerType } = params

    if (providerType === 'AUTH') {
      await (provider as unknown as W3mFrameProvider).switchNetwork(caipNetwork.id)
      const user = await (provider as unknown as W3mFrameProvider).getUser({
        chainId: caipNetwork.id
      })
      this.authSession = user
    }

    if (caipNetwork?.rpcUrls?.default?.http?.[0]) {
      SolStoreUtil.setConnection(
        new Connection(caipNetwork?.rpcUrls?.default.http[0] as string, this.connectionSettings)
      )
    }
  }

  private listenProviderEvents(provider: Provider) {
    const disconnectHandler = () => {
      this.removeProviderListeners(provider)
      this.emit('disconnect')
    }

    const accountsChangedHandler = (publicKey: PublicKey) => {
      const address = publicKey.toBase58()
      if (address) {
        this.emit('accountChanged', { address })
      }
    }

    provider.on('disconnect', disconnectHandler)
    provider.on('accountsChanged', accountsChangedHandler)
    provider.on('connect', accountsChangedHandler)

    this.providerHandlers = {
      disconnect: disconnectHandler,
      accountsChanged: accountsChangedHandler
    }
  }

  private providerHandlers: {
    disconnect: () => void
    accountsChanged: (publicKey: PublicKey) => void
  } | null = null

  private removeProviderListeners(provider: Provider) {
    if (this.providerHandlers) {
      provider.removeListener('disconnect', this.providerHandlers.disconnect)
      provider.removeListener('accountsChanged', this.providerHandlers.accountsChanged)
      provider.removeListener('connect', this.providerHandlers.accountsChanged)
      this.providerHandlers = null
    }
  }

  public async connectWalletConnect(onUri: (uri: string) => void): Promise<void> {
    const connector = this.connectors.find(c => c.type === 'WALLET_CONNECT')
    const provider = connector?.provider as UniversalProvider

    if (!this.caipNetworks || !provider) {
      throw new Error(
        'UniversalAdapter:connectWalletConnect - caipNetworks or provider is undefined'
      )
    }

    provider.on('display_uri', (uri: string) => {
      onUri(uri)
    })

    const namespaces = WcHelpersUtil.createNamespaces(this.caipNetworks)
    await provider.connect({ optionalNamespaces: namespaces })
  }

  public async disconnect(params: AdapterBlueprint.DisconnectParams): Promise<void> {
    if (!params.provider || !params.providerType) {
      throw new Error('Provider or providerType not provided')
    }

    await params.provider.disconnect()
  }

  public async getProfile(): Promise<AdapterBlueprint.GetProfileResult> {
    return Promise.resolve({
      profileName: undefined,
      profileImage: undefined
    })
  }

  public async syncConnection(
    params: AdapterBlueprint.SyncConnectionParams
  ): Promise<AdapterBlueprint.ConnectResult> {
    const { id, rpcUrl } = params
    const connector = this.connectors.find(c => c.id === id)
    const selectedProvider = connector?.provider as Provider

    if (!selectedProvider) {
      throw new Error('Provider not found')
    }

    // Handle different provider types
    if (connector?.type === 'AUTH') {
      const authProvider = selectedProvider as unknown as W3mFrameProvider
      const user = await authProvider.getUser({
        chainId: Number(this.caipNetworks?.[0]?.id)
      })

      if (!user?.address) {
        throw new Error('No address found')
      }

      return {
        address: user.address,
        chainId: typeof user.chainId === 'string' ? Number(user.chainId.split(':')[1]) : 1,
        provider: selectedProvider,
        type: connector.type,
        id
      }
    }

    // For standard Solana wallets
    const address = await selectedProvider.connect()
    const chainId = this.caipNetworks?.[0]?.id || 1

    this.listenProviderEvents(selectedProvider)

    SolStoreUtil.setConnection(new Connection(rpcUrl, 'confirmed'))

    return {
      address,
      chainId: Number(chainId),
      provider: selectedProvider,
      type: connector?.type as ConnectorType,
      id
    }
  }
}
