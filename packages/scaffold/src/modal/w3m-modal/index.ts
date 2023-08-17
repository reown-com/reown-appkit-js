import { ApiController, ModalController, SnackController, ThemeController } from '@web3modal/core'
import { initializeTheming, setColorTheme } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { animate } from 'motion'
import styles from './styles.js'

// -- Helpers --------------------------------------------- //
const SCROLL_LOCK = 'scroll-lock'

@customElement('w3m-modal')
export class W3mModal extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  private abortController?: AbortController = undefined

  // -- State & Properties -------------------------------- //
  @state() private open = ModalController.state.open

  public constructor() {
    super()
    initializeTheming(ThemeController.state.themeVariables)
    setColorTheme(ThemeController.state.themeMode)
    ApiController.fetchRecommendedWallets()
    ApiController.fetchNetworkImages()
    this.unsubscribe.push(
      ModalController.subscribeKey('open', val => (val ? this.onOpen() : this.onClose()))
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
    this.onRemoveKeyboardListener()
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return this.open
      ? html`
          <wui-overlay @click=${this.onOverlayClick.bind(this)}>
            <wui-card role="alertdialog" aria-modal="true" tabindex="0">
              <w3m-header></w3m-header>
              <w3m-router></w3m-router>
              <w3m-snackbar></w3m-snackbar>
            </wui-card>
          </wui-overlay>
        `
      : null
  }

  // -- Private ------------------------------------------- //
  private onOverlayClick(event: PointerEvent) {
    if (event.target === event.currentTarget) {
      ModalController.close()
    }
  }

  private async onClose() {
    this.onScrollUnlock()
    await animate(this, { opacity: [1, 0] }, { duration: 0.2 }).finished
    SnackController.hide()
    this.open = false
    this.onRemoveKeyboardListener()
  }

  private async onOpen() {
    this.onScrollLock()
    this.open = true
    await animate(this, { opacity: [0, 1] }, { duration: 0.2 }).finished
    this.onAddKeyboardListener()
  }

  private onScrollLock() {
    const styleTag = document.createElement('style')
    styleTag.dataset['w3m'] = SCROLL_LOCK
    styleTag.textContent = `
      html, body {
        touch-action: none;
        overflow: hidden;
        overscroll-behavior: contain;
        scrollbar-gutter: stable;
      }
    `
    document.head.appendChild(styleTag)
  }

  private onScrollUnlock() {
    const styleTag = document.head.querySelector(`style[data-w3m="${SCROLL_LOCK}"]`)
    if (styleTag) {
      styleTag.remove()
    }
  }

  private onAddKeyboardListener() {
    this.abortController = new AbortController()
    const card = this.shadowRoot?.querySelector('wui-card')
    card?.focus()
    window.addEventListener(
      'keydown',
      event => {
        if (event.key === 'Escape') {
          ModalController.close()
        } else if (event.key === 'Tab') {
          const { tagName } = event.target as HTMLElement
          if (tagName && !tagName.includes('W3M-') && !tagName.includes('WUI-')) {
            card?.focus()
          }
        }
      },
      this.abortController
    )
  }

  private onRemoveKeyboardListener() {
    this.abortController?.abort()
    this.abortController = undefined
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-modal': W3mModal
  }
}
