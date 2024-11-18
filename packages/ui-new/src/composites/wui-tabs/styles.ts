import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host {
    display: inline-flex;
    align-items: center;
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
    border-radius: ${({ radii }) => radii[32]};
    border: 3px solid ${({ tokens }) => tokens.theme.foregroundPrimary};
  }
`
