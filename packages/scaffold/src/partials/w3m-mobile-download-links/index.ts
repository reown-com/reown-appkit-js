import type { WcWallet } from '@web3modal/core'
import { CoreHelperUtil } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import styles from './styles.js'

@customElement('w3m-mobile-download-links')
export class W3mMobileDownloadLinks extends LitElement {
  public static override styles = [styles]

  // -- State & Properties -------------------------------- //
  @property({ type: Object }) wallet?: WcWallet = undefined

  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.wallet) {
      this.style.display = 'none'

      return null
    }
    const { name, app_store, play_store } = this.wallet
    const isMobile = CoreHelperUtil.isMobile()
    const isIos = CoreHelperUtil.isIos()
    const isAndroid = CoreHelperUtil.isAndroid()

    if (app_store && play_store && !isMobile) {
      return html`
        <wui-cta-button
          label=${`Don't have ${name}?`}
          buttonLabel="Get"
          @click=${() => console.log('blagh')}
        ></wui-cta-button>
      `
    }

    if (app_store && isIos) {
      return html`
        <wui-cta-button
          label=${`Don't have ${name}?`}
          buttonLabel="Get"
          @click=${this.onAppStore.bind(this)}
        ></wui-cta-button>
      `
    }

    if (play_store && isAndroid) {
      return html`
        <wui-cta-button
          label=${`Don't have ${name}?`}
          buttonLabel="Get"
          @click=${this.onPlayStore.bind(this)}
        ></wui-cta-button>
      `
    }

    this.style.display = 'none'

    return null
  }

  // -- Private ------------------------------------------- //
  private onAppStore() {
    if (this.wallet?.app_store) {
      CoreHelperUtil.openHref(this.wallet.app_store, '_blank')
    }
  }

  private onPlayStore() {
    if (this.wallet?.play_store) {
      CoreHelperUtil.openHref(this.wallet.play_store, '_blank')
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-mobile-download-links': W3mMobileDownloadLinks
  }
}
