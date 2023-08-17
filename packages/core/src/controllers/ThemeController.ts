import { subscribeKey as subKey } from 'valtio/utils'
import { proxy } from 'valtio/vanilla'
import type { ThemeMode, ThemeVariables } from '../utils/TypeUtils.js'

// -- Types --------------------------------------------- //
export interface ThemeControllerState {
  themeMode: ThemeMode
  themeVariables: ThemeVariables
}

type StateKey = keyof ThemeControllerState

// -- State --------------------------------------------- //
const state = proxy<ThemeControllerState>({
  themeMode: 'dark',
  themeVariables: {}
})

// -- Controller ---------------------------------------- //
export const ThemeController = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: ThemeControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  setThemeMode(themeMode: ThemeMode) {
    state.themeMode = themeMode
  },

  setThemeVariables(themeVariables: ThemeVariables) {
    state.themeVariables = themeVariables
  }
}
