'use client'

import React, { createContext } from 'react'
import type { Features, ThemeMode, SocialProvider } from '@reown/appkit-core'
import { URLState } from '@/lib/url-state'

interface AppKitContextType {
  config: URLState
  enableWallets: boolean
  isLoading: boolean
  isDrawerOpen: boolean
  socialsEnabled: boolean
  isDraggingByKey: Record<string, boolean>
  isInitialized: boolean
  replaceConfig: (config: URLState) => void
  setIsDrawerOpen: (open: boolean) => void
  updateThemeMode: (mode: ThemeMode) => void
  updateFeatures: (features: Partial<Features>) => void
  updateSocials: (enabled: boolean) => void
  updateEnableWallets: (enabled: boolean) => void
  updateUrls: (urls: { termsConditions?: string; privacyPolicy?: string }) => void
  setEnableWallets: (enabled: boolean) => void
  setSocialsOrder: ((order: SocialProvider[]) => void) | undefined
  updateDraggingState: (key: string, dragging: boolean) => void
}

export const AppKitContext = createContext<AppKitContextType | undefined>(undefined)
