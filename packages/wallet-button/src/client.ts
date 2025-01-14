import { ConnectorController, type Connector } from '@reown/appkit-core'
import { WalletButtonController } from './controllers/WalletButtonController.js'
import { ConstantsUtil } from './utils/ConstantsUtil.js'
import { ConnectorUtil } from './utils/ConnectorUtil.js'
import type { SocialProvider, Wallet } from './utils/TypeUtil.js'
import { WalletUtil } from './utils/WalletUtil.js'
import { ApiController } from './controllers/ApiController.js'

export class AppKitWalletButton {
  public isReady = WalletButtonController.state.ready

  constructor() {
    if (!this.isReady) {
      ApiController.fetchWalletButtons()
    }
  }

  public subscribeIsReady(callback: ({ isReady }: { isReady: boolean }) => void) {
    ApiController.subscribeKey('walletButtons', val => {
      if (val.length) {
        callback({ isReady: true })
      } else {
        callback({ isReady: false })
      }
    })
  }

  async connect(wallet: Wallet) {
    const connectors = ConnectorController.state.connectors

    if (ConstantsUtil.Socials.some(social => social === wallet)) {
      return ConnectorUtil.connectSocial(wallet as SocialProvider)
    }

    const walletButton = WalletUtil.getWalletButton(wallet)

    const connector = walletButton
      ? ConnectorController.getConnector(walletButton.id, walletButton.rdns)
      : undefined

    if (connector) {
      return ConnectorUtil.connectExternal(connector)
    }

    return ConnectorUtil.connectWalletConnect({
      walletConnect: wallet === 'walletConnect',
      connector: connectors.find(c => c.id === 'walletConnect') as Connector | undefined,
      wallet: walletButton
    })
  }
}
