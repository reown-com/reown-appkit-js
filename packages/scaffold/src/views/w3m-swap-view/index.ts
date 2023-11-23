import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import styles from './styles.js'
import {
  SwapApiController,
  EventsController,
  RouterController,
  CoreHelperUtil
} from '@web3modal/core'
import type { TokenInfo } from '@web3modal/core/src/controllers/SwapApiController.js'
type Target = 'sourceToken' | 'toToken'
@customElement('w3m-swap-view')
export class W3mSwapView extends LitElement {
  public static override styles = styles

  private unsubscribe: ((() => void) | undefined)[] = []

  // -- State & Properties -------------------------------- //
  @state() private loading = SwapApiController.state.loading

  @state() private sourceToken = SwapApiController.state.sourceToken

  @state() private toToken = SwapApiController.state.toToken

  @state() private swapErrorMessage = SwapApiController.state.swapErrorMessage

  @state() private sourceTokenAmount = SwapApiController.state.sourceTokenAmount ?? ''

  @state() private toTokenAmount = SwapApiController.state.toTokenAmount ?? ''

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()
    SwapApiController.getTokenList()
    SwapApiController.getMyTokensWithBalance()

    this.unsubscribe.push(
      ...[
        SwapApiController.subscribe(newState => {
          if (this.sourceTokenAmount !== newState.sourceTokenAmount) {
            this.sourceTokenAmount = newState.sourceTokenAmount ?? ''
          }
          if (this.toTokenAmount !== newState.toTokenAmount) {
            this.toTokenAmount = newState.toTokenAmount ?? ''
          }
          if (this.sourceToken?.address !== newState.sourceToken?.address) {
            this.sourceToken = newState.sourceToken
          }
          if (this.swapErrorMessage !== newState.swapErrorMessage) {
            this.swapErrorMessage = newState.swapErrorMessage
          }
        })
      ]
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe?.())
  }

  private getInputElement(el: HTMLElement) {
    if (el.shadowRoot?.querySelector('input')) {
      return el.shadowRoot.querySelector('input')
    }

    return null
  }

  private onInputChange(event: InputEvent) {
    const inputElement = event.target as HTMLElement
    const input = this.getInputElement(inputElement)
    if (input) {
      SwapApiController.setSourceTokenAmount(input.value)
      this.onDebouncedGetSwapCalldata(input.value)
    }
  }

  private onDebouncedGetSwapCalldata = CoreHelperUtil.debounce(async () => {
    if (this.sourceToken?.address && this.toToken?.address) {
      const swapCalldata = await SwapApiController.getSwapCalldata()
      // This.toTokenAmount = swapCalldata.toAmount
      console.log({ swapCalldata })
    }
  })

  private async onSwap() {
    await SwapApiController.swapTokens()
  }

  private onSwitchTokens() {
    SwapApiController.switchTokens()
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" padding="s" gap="s">
        ${this.loading ? this.templateLoading() : this.templateSwap()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private templateSwap() {
    return html`
      <wui-flex flexDirection="column" gap="sm">
        <wui-flex
          flexDirection="column"
          alignItems="center"
          gap="xs"
          .padding=${['xs', 's', 's', 's'] as const}
          class="swap-inputs-container"
        >
          ${this.templateTokenInput('sourceToken', this.sourceToken)}
          ${this.templateTokenInput('toToken', this.toToken)} ${this.templateReplaceTokensButton()}
        </wui-flex>
        <wui-flex flexDirection="column" .padding=${['xs', 's', 's', 's'] as const}>
          <wui-text variant="paragraph-500" color="error-100">${this.swapErrorMessage}</wui-text>

          <wui-button class="action-button" variant="fullWidth" @click=${this.onSwap.bind(this)}>
            Enter amount
          </wui-button>
        </wui-flex>
      </wui-flex>
    `
  }

  private templateReplaceTokensButton() {
    return html`
      <div class="replace-tokens-button-container" @click=${this.onSwitchTokens.bind(this)}>
        <button class="replace-tokens-button">
          <svg
            width="20"
            height="20"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M8.30713 0.292893C8.69766 0.683417 8.69766 1.31658 8.30713 1.70711L6.41424 3.6H11.3404C13.8369 3.6 16.0533 5.1975 16.8427 7.56588L16.9487 7.88377C17.1234 8.40772 16.8402 8.97404 16.3163 9.14868C15.7923 9.32333 15.226 9.04017 15.0513 8.51623L14.9454 8.19834C14.4281 6.64664 12.976 5.6 11.3404 5.6H6.41424L8.30713 7.49289C8.69766 7.88342 8.69766 8.51658 8.30713 8.90711C7.91661 9.29763 7.28344 9.29763 6.89292 8.90711L3.29292 5.30711C2.9024 4.91658 2.9024 4.28342 3.29292 3.89289L6.89292 0.292893C7.28344 -0.0976311 7.91661 -0.0976311 8.30713 0.292893ZM3.6838 10.8513C4.20774 10.6767 4.77406 10.9598 4.94871 11.4838L5.05467 11.8017C5.57191 13.3534 7.02404 14.4 8.65967 14.4L13.5858 14.4L11.6929 12.5071C11.3024 12.1166 11.3024 11.4834 11.6929 11.0929C12.0834 10.7024 12.7166 10.7024 13.1071 11.0929L16.7071 14.6929C17.0977 15.0834 17.0977 15.7166 16.7071 16.1071L13.1071 19.7071C12.7166 20.0976 12.0834 20.0976 11.6929 19.7071C11.3024 19.3166 11.3024 18.6834 11.6929 18.2929L13.5858 16.4L8.65967 16.4C6.16317 16.4 3.94677 14.8025 3.15731 12.4341L3.05134 12.1162C2.8767 11.5923 3.15986 11.026 3.6838 10.8513Z"
              fill="#788181"
            />
          </svg>
        </button>
      </div>
    `
  }

  private templateLoading() {
    return html`<wui-flex
      flexGrow="1"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      .padding=${['3xl', 'xl', '3xl', 'xl'] as const}
      gap="xl"
    >
      <wui-icon-box
        backgroundColor="glass-005"
        background="gray"
        iconColor="fg-200"
        icon="swapHorizontalRoundedBold"
        size="lg"
        ?border=${true}
        borderColor="wui-color-bg-125"
      ></wui-icon-box>
      <wui-text align="center" variant="paragraph-500" color="fg-100">Swaping</wui-text>
      <wui-loading-hexagon></wui-loading-hexagon>
    </wui-flex>`
  }

  private templateTokenInput(target: Target, token?: TokenInfo) {
    return html`<wui-flex justifyContent="space-between" gap="sm" class="swap-input">
      <wui-flex flex="1">
        <wui-input-text
          @input=${this.onInputChange.bind(this)}
          .value=${target === 'toToken' ? this.toTokenAmount : this.sourceTokenAmount}
        />
      </wui-flex>
      ${this.templateTokenSelectButton(target, token)}
    </wui-flex> `
  }

  private templateTokenSelectButton(target: Target, token?: TokenInfo) {
    if (!token) {
      return html` <wui-button
        size="md"
        variant="accentBg"
        @click=${() => this.onSelectToken(target)}
      >
        Select token
      </wui-button>`
    }

    const tokenElement = token.logoURI
      ? html`<wui-image width="40" height="40" src=${token.logoURI}></wui-image>`
      : html`
          <wui-icon-box
            size="sm"
            iconColor="fg-200"
            backgroundColor="fg-300"
            icon="networkPlaceholder"
          ></wui-icon-box>
        `

    return html`
      <div class="token-select-button-container" @click=${() => this.onSelectToken(target)}>
        <button class="token-select-button">
          ${tokenElement}
          <wui-text variant="paragraph-600" color="fg-100">${token.symbol}</wui-text>
        </button>
      </div>
    `
  }

  private onSelectToken(target: Target) {
    EventsController.sendEvent({ type: 'track', event: 'CLICK_SELECT_TOKEN_TO_SWAP' })
    RouterController.push('SwapSelectToken', {
      target
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-swap-view': W3mSwapView
  }
}
