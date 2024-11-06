import type { WcWallet } from '@reown/appkit-core'
import {
  AssetUtil,
  ConnectionController,
  ConnectorController,
  CoreHelperUtil,
  OptionsController,
  RouterController,
  StorageUtil
} from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('w3m-connect-custom-widget')
export class W3mConnectCustomWidget extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private connectors = ConnectorController.state.connectors
  @state() private loading = false

  public constructor() {
    super()
    this.unsubscribe.push(
      ConnectorController.subscribeKey('connectors', val => (this.connectors = val))
    )
    if (CoreHelperUtil.isTelegram() && CoreHelperUtil.isIos()) {
      this.loading = !ConnectionController.state.wcUri
      this.unsubscribe.push(
        ConnectionController.subscribeKey('wcUri', val => (this.loading = !val))
      )
    }
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const { customWallets } = OptionsController.state

    if (!customWallets?.length) {
      this.style.cssText = `display: none`

      return null
    }

    const wallets = this.filterOutDuplicateWallets(customWallets)

    return html`<wui-flex flexDirection="column" gap="xs">
      ${wallets.map(
        wallet => html`
          <wui-list-wallet
            imageSrc=${ifDefined(AssetUtil.getWalletImage(wallet))}
            name=${wallet.name ?? 'Unknown'}
            ?loading=${this.loading}
            @click=${() => this.onConnectWallet(wallet)}
            data-testid=${`wallet-selector-${wallet.id}`}
          >
          </wui-list-wallet>
        `
      )}
    </wui-flex>`
  }

  // -- Private Methods ----------------------------------- //
  private filterOutDuplicateWallets(wallets: WcWallet[]) {
    const recent = StorageUtil.getRecentWallets()

    const connectorRDNSs = this.connectors
      .map(connector => connector.info?.rdns)
      .filter(Boolean) as string[]

    const recentRDNSs = recent.map(wallet => wallet.rdns).filter(Boolean) as string[]
    const allRDNSs = connectorRDNSs.concat(recentRDNSs)
    if (allRDNSs.includes('io.metamask.mobile') && CoreHelperUtil.isMobile()) {
      const index = allRDNSs.indexOf('io.metamask.mobile')
      allRDNSs[index] = 'io.metamask'
    }
    const filtered = wallets.filter(wallet => !allRDNSs.includes(String(wallet?.rdns)))

    return filtered
  }

  private onConnectWallet(wallet: WcWallet) {
    if (this.loading) {
      return
    }
    RouterController.push('ConnectingWalletConnect', { wallet })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-custom-widget': W3mConnectCustomWidget
  }
}
