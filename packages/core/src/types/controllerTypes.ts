import type { EthereumClient } from '@web3modal/ethereum'

interface MobileWallet {
  id: string
  name: string
  links: {
    universal: string
    deep?: string
  }
}

interface DesktopWallet {
  id: string
  name: string
  links: {
    deep: string
    universal: string
  }
}

// -- ConfigCtrl ------------------------------------------- //
export interface ConfigCtrlState {
  projectId?: string
  theme?: 'dark' | 'light'
  accentColor?:
    | 'blackWhite'
    | 'blue'
    | 'default'
    | 'green'
    | 'magenta'
    | 'orange'
    | 'purple'
    | 'teal'
  standaloneChains?: string[]
  mobileWallets?: MobileWallet[]
  desktopWallets?: DesktopWallet[]
  walletImages?: Record<string, string>
  chainImages?: Record<string, string>
}

// -- ModalCtrl --------------------------------------- //
export interface ModalCtrlState {
  open: boolean
}

// -- OptionsCtrl --------------------------------------- //
export interface OptionsCtrlState {
  selectedChainId?: number
  chains?: EthereumClient['chains']
  standaloneChains?: string[]
  standaloneUri?: string
}

// -- ExplorerCtrl ------------------------------------------- //
export interface ExplorerCtrlState {
  wallets: ListingResponse & { page: number }
  search: ListingResponse & { page: number }
  previewWallets: Listing[]
  recomendedWallets: Listing[]
}

export interface PageParams {
  page?: number
  search?: string
  entries?: number
  version?: number
  device?: 'desktop' | 'mobile'
  order?: 'asc' | 'desc'
  chains?: string
}

export interface PlatformInfo {
  native: string
  universal: string
}

export interface Listing {
  id: string
  name: string
  description: string
  homepage: string
  chains: string[]
  versions: string[]
  app_type: string
  image_id: string
  image_url: {
    sm: string
    md: string
    lg: string
  }
  app: {
    browser: string
    ios: string
    android: string
    mac: string
    window: string
    linux: string
  }
  mobile: PlatformInfo
  desktop: PlatformInfo
  metadata: {
    shortName: string
    colors: {
      primary: string
      secondary: string
    }
  }
}

export interface ListingResponse {
  listings: Listing[]
  total: number
}

// -- ToastCtrl ------------------------------------------ //
export interface ToastCtrlState {
  open: boolean
  message: string
  variant: 'error' | 'success'
}

// -- RouterCtrl --------------------------------------------- //
export type RouterView =
  | 'CoinbaseExtensionConnector'
  | 'CoinbaseMobileConnector'
  | 'ConnectWallet'
  | 'DesktopConnector'
  | 'GetWallet'
  | 'Help'
  | 'InjectedConnector'
  | 'MetaMaskConnector'
  | 'Qrcode'
  | 'SelectNetwork'
  | 'WalletExplorer'
  | 'WalletFilter'

export interface RouterCtrlState {
  history: RouterView[]
  view: RouterView
  data?: {
    DesktopConnector: {
      name: string
      deeplink?: string
      universal?: string
      icon?: string
      walletId?: string
    }
  }
}

// -- ClientCtrl ------------------------------------------- //
export interface ClientCtrlState {
  initialized: boolean
  ethereumClient?: EthereumClient
}
