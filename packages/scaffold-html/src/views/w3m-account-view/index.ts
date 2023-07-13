import { AccountController, CoreHelperUtil } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('w3m-account-view')
export class W3mAccountView extends LitElement {
  // -- State & Properties --------------------------------- //
  @state() private address = AccountController.state.address

  @state() private profileImage = AccountController.state.profileImage

  @state() private profileName = AccountController.state.profileName

  public constructor() {
    super()
    AccountController.subscribe('address', value => (this.address = value))
    AccountController.subscribe('profileImage', value => (this.profileImage = value))
    AccountController.subscribe('profileName', value => (this.profileName = value))
  }

  // -- Render -------------------------------------------- //
  public render() {
    if (!this.address) {
      throw new Error('w3m-account-view: No account provided')
    }

    return html`
      <wui-flex flexDirection="column" padding="l" alignItems="center" gap="xs">
        <wui-avatar
          alt=${this.address}
          address=${this.address}
          imageSrc=${ifDefined(this.profileImage)}
        ></wui-avatar>

        <wui-flex gap="3xs" alignItems="center">
          <wui-text variant="large-600" color="fg-100">
            ${this.profileName ?? CoreHelperUtil.truncateAddress(this.address)}
          </wui-text>
          <wui-icon-link
            size="md"
            icon="copy"
            iconColor="fg-200"
            @click=${this.onCopyAddress}
          ></wui-icon-link>
        </wui-flex>
      </wui-flex>
    `
  }

  // -- Private Methods ------------------------------------ //
  private onCopyAddress() {
    try {
      if (this.address) {
        CoreHelperUtil.copyToClopboard(this.address)
      }
    } catch {
      // TASK: Show error toast
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-account-view': W3mAccountView
  }
}
