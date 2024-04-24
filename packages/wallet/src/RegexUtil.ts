export const RegexUtil = {
  address: /^0x(?:[A-Fa-f0-9]{40})$/u,
  transactionHash: /^0x(?:[A-Fa-f0-9]{64})$/u,
  // signed message hash can be variable length
  signedMessage: /^0x(?:[a-fA-F0-9]{6,})$/u
}
