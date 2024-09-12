import type { Meta } from '@storybook/web-components'
import '@rerock/appkit-ui/src/composites/wui-input-numeric'
import type { WuiInputNumeric } from '@rerock/appkit-ui/src/composites/wui-input-numeric'
import { html } from 'lit'
import '../../components/gallery-container'

type Component = Meta<WuiInputNumeric>

export default {
  title: 'Composites/wui-input-numeric',
  args: {
    disabled: false
  },
  argTypes: {
    disabled: {
      control: { type: 'boolean' }
    }
  }
} as Component

export const Default: Component = {
  render: args => html` <wui-input-numeric ?disabled=${args.disabled}></wui-input-numeric>`
}
