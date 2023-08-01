import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { resetStyles } from '../../utils/ThemeUtil'
import type { IWalletImage } from '../../utils/TypesUtil'
import '../wui-wallet-image'
import styles from './styles'

const TOTAL_IMAGES = 4

@customElement('wui-all-wallets-image')
export class WuiAllWalletsImage extends LitElement {
  public static styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property({ type: Array }) public walletImages: IWalletImage[] = []

  // -- Render -------------------------------------------- //
  public render() {
    const isPlaceholders = this.walletImages.length < TOTAL_IMAGES

    return html`${this.walletImages
      .slice(0, TOTAL_IMAGES)
      .map(
        ({ src, walletName }) => html`
          <wui-wallet-image
            size="inherit"
            imageSrc=${src}
            name=${ifDefined(walletName)}
          ></wui-wallet-image>
        `
      )}
    ${isPlaceholders
      ? [...Array(TOTAL_IMAGES - this.walletImages.length)].map(
          () => html` <wui-wallet-image size="inherit" name=""></wui-wallet-image>`
        )
      : null}`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-all-wallets-image': WuiAllWalletsImage
  }
}
