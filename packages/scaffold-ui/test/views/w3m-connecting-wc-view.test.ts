import { describe, it, expect, vi, beforeEach, test, beforeAll } from 'vitest'
import { CoreHelperUtil, RouterController } from '@reown/appkit-core'
import type { W3mConnectingWcView } from '../../exports'
import { elementUpdated, fixture } from '@open-wc/testing'
import { html } from 'lit'
import type { WcWallet } from '@reown/appkit-core'
import { HelpersUtil } from '../utils/HelpersUtil'
import type { WuiTabs } from '@reown/appkit-ui'

// --- Constants ---------------------------------------------------- //

const WALLET = {
  id: 'metamask',
  name: 'MetaMask'
} as WcWallet

describe('W3mConnectingWcView - Render', () => {
  test.skip('should render walletConnect widget if no wallet is give', async () => {
    const element: W3mConnectingWcView = await fixture(
      html`<w3m-connecting-wc-view></w3m-connecting-wc-view>`
    )

    expect(HelpersUtil.querySelect(element, 'w3m-connecting-wc-qrcode')).not.toBeNull()
  })

  test('should render web and browser platforms if rdns and webapp_link is present', async () => {
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(false)

    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: {
        wallet: {
          ...WALLET,
          rdns: 'metamask.io',
          webapp_link: 'https://metamask.io'
        }
      }
    })

    const element: W3mConnectingWcView = await fixture(
      html`<w3m-connecting-wc-view></w3m-connecting-wc-view>`
    )

    const w3mConnectingHeader = HelpersUtil.querySelect(element, 'w3m-connecting-header')

    expect(w3mConnectingHeader).not.toBeNull()

    const wuiTabs = HelpersUtil.querySelect(w3mConnectingHeader, 'wui-tabs') as WuiTabs

    expect(wuiTabs).not.toBeNull()

    const tabsProperty = wuiTabs.tabs

    expect(tabsProperty).toStrictEqual([
      { label: 'Webapp', icon: 'browser', platform: 'web' },
      { label: 'Browser', icon: 'extension', platform: 'unsupported' }
    ])
  })

  test('should render web,mo browser platforms if rdns and webapp_link is present', async () => {
    vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(true)

    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: {
        wallet: {
          ...WALLET,
          webapp_link: 'https://metamask.io',
          mobile_link: 'https://metamask.io'
        }
      }
    })

    const element: W3mConnectingWcView = await fixture(
      html`<w3m-connecting-wc-view></w3m-connecting-wc-view>`
    )

    const w3mConnectingHeader = HelpersUtil.querySelect(element, 'w3m-connecting-header')

    expect(w3mConnectingHeader).not.toBeNull()

    const wuiTabs = HelpersUtil.querySelect(w3mConnectingHeader, 'wui-tabs') as WuiTabs

    expect(wuiTabs).not.toBeNull()

    const tabsProperty = wuiTabs.tabs

    expect(tabsProperty).toStrictEqual([
      { label: 'Mobile', icon: 'mobile', platform: 'mobile' },
      { label: 'Browser', icon: 'extension', platform: 'unsupported' },
      { label: 'Webapp', icon: 'browser', platform: 'web' }
    ])
  })
})
