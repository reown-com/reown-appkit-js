import { ExplorerApiController } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import styles from './styles'

@customElement('w3m-all-wallets-search')
export class W3mAllWalletsSearch extends LitElement {
  public static styles = styles

  // -- Members ------------------------------------------- //
  private prevQuery = ''

  // -- State & Properties -------------------------------- //
  @state() private loading = true

  @property() private query = ''

  // -- Render -------------------------------------------- //
  public render() {
    this.onSearch()

    return this.loading
      ? html`<wui-loading-spinner></wui-loading-spinner>`
      : html`
          <wui-grid
            .padding=${['0', 's', 's', 's'] as const}
            gridTemplateColumns="repeat(4, 1fr)"
            gridTemplateRows="auto 1fr"
            rowGap="l"
            columnGap="xs"
          >
            ${this.walletsTemplate()}
          </wui-grid>
        `
  }

  // Private Methods ------------------------------------- //
  private async onSearch() {
    if (this.query !== this.prevQuery) {
      this.prevQuery = this.query
      this.loading = true
      await ExplorerApiController.searchListings({ search: this.query })
      this.loading = false
    }
  }

  private walletsTemplate() {
    const { search } = ExplorerApiController.state

    return search.map(
      wallet => html` <wui-card-select type="wallet" name=${wallet.name}></wui-card-select> `
    )
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-all-wallets-search': W3mAllWalletsSearch
  }
}
