import type { Meta } from '@storybook/web-components'
import '@web3modal/ui/src/composites/wui-profile-button'
import type { WuiProfileButton } from '@web3modal/ui/src/composites/wui-profile-button'
import { html } from 'lit'
import { address, avatarImageSrc, networkImageSrc } from '../../utils/PresetUtils'

type Component = Meta<WuiProfileButton>

export default {
  title: 'Composites/wui-profile-button',
  args: {
    networkSrc: networkImageSrc,
    avatarSrc: avatarImageSrc,
    address,
    profileName: 'enesozturk.eth'
  },
  argTypes: {
    profileName: {
      control: { type: 'text' }
    }
  }
} as Component

export const Default: Component = {
  render: args =>
    html`<wui-profile-button
      profileName=${args.profileName}
      .networkSrc=${args.networkSrc}
      .avatarSrc=${args.avatarSrc}
      address=${args.address}
    ></wui-profile-button>`
}
