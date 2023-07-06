import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-loading-thumbnail'
import type { WuiLoadingThumbnail } from '@web3modal/ui/src/composites/wui-loading-thumbnail'
import { html } from 'lit'

type Component = Meta<WuiLoadingThumbnail>

export default {
  title: 'Composites/wui-loading-thumbnail',
  args: {
    loading: true
  }
} as Component

export const Default: Component = {
  render: args => html` <wui-loading-thumbnail ?loading=${args.loading}></wui-loading-thumbnail> `
}
