import {
  AccountController,
  ConnectionController,
  CoreHelperUtil,
  ModalController,
  RouterController,
  SnackController
} from '@web3modal/core'
import { UiHelperUtil } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import styles from './styles.js'

@customElement('w3m-account-view')
export class W3mAccountView extends LitElement {
  public static override styles = styles

  // -- Members -------------------------------------------- //
  private usubscribe: (() => void)[] = []

  // -- State & Properties --------------------------------- //
  @state() private address = AccountController.state.address

  @state() private profileImage = AccountController.state.profileImage

  @state() private profileName = AccountController.state.profileName

  @state() private balance = AccountController.state.balance

  @state() private balanceSymbol = AccountController.state.balanceSymbol

  public constructor() {
    super()
    this.usubscribe.push(
      AccountController.subscribe(val => {
        if (val.address) {
          this.address = val.address
          this.profileImage = val.profileImage
          this.profileName = val.profileName
          this.balance = val.balance
          this.balanceSymbol = val.balanceSymbol
        } else {
          ModalController.close()
        }
      })
    )
  }

  public override disconnectedCallback() {
    this.usubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.address) {
      throw new Error('w3m-account-view: No account provided')
    }

    return html`
      <wui-flex
        flexDirection="column"
        .padding=${['s', 's', 'xl', 's'] as const}
        alignItems="center"
        gap="xs"
      >
        <wui-avatar
          alt=${this.address}
          address=${this.address}
          imageSrc=${ifDefined(this.profileImage)}
        ></wui-avatar>

        <wui-flex gap="3xs" alignItems="center" justifyContent="center">
          <wui-text variant="large-600" color="fg-100">
            ${this.profileName ?? UiHelperUtil.getTruncateAddress(this.address, 4)}
          </wui-text>
          <wui-icon-link
            size="md"
            icon="copy"
            iconColor="fg-200"
            @click=${this.onCopyAddress}
          ></wui-icon-link>
        </wui-flex>
      </wui-flex>

      <wui-flex flexDirection="column" gap="xs" .padding=${['0', 's', 's', 's'] as const}>
        <wui-list-item
          variant="icon"
          iconVariant="overlay"
          icon="networkPlaceholder"
          @click=${this.onNetworks.bind(this)}
        >
          <wui-text variant="paragraph-500" color="fg-100">${this.showBalance()}</wui-text>
        </wui-list-item>
        <wui-list-item
          variant="icon"
          iconVariant="overlay"
          icon="disconnect"
          @click=${this.onDisconnect.bind(this)}
        >
          <wui-text variant="paragraph-500" color="fg-200">Disconnect</wui-text>
        </wui-list-item>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private onCopyAddress() {
    try {
      if (this.address) {
        CoreHelperUtil.copyToClopboard(this.address)
        SnackController.showSuccess('Address copied')
      }
    } catch {
      SnackController.showError('Failed to copy')
    }
  }

  private onNetworks() {
    RouterController.push('Networks')
  }

  private async onDisconnect() {
    await ConnectionController.disconnect()
    ModalController.close()
  }

  private showBalance() {
    let formattedBalance = undefined

    if (this.balance === '0.0') {
      formattedBalance = '0'
    } else if (typeof this.balance === 'string' && this.balance.length > 6) {
      formattedBalance = this.balance.substring(0, 6)
    } else if (typeof this.balance === 'string') {
      formattedBalance = this.balance
    }

    return formattedBalance ? `${formattedBalance} ${this.balanceSymbol}` : '_._'
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-account-view': W3mAccountView
  }
}
