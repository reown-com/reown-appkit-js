import { CoreHelpers } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import '../../components/w3m-modal-content'
import '../../components/w3m-modal-header'
import '../../partials/w3m-desktop-wallet-selection'
import '../../partials/w3m-mobile-wallet-selection'
import { global } from '../../utils/Theme'

@customElement('w3m-connect-wallet-view')
export class W3mConnectWalletView extends LitElement {
  public static styles = [global]

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <w3m-modal-header title="Connect your wallet"></w3m-modal-header>
      ${CoreHelpers.isMobile()
        ? html`<w3m-mobile-wallet-selection></w3m-mobile-wallet-selection>`
        : html`<w3m-desktop-wallet-selection></w3m-desktop-wallet-selection>`}
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-wallet-view': W3mConnectWalletView
  }
}
