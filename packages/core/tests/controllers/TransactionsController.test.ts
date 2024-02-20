import { describe, expect, it, vi } from 'vitest'
import { BlockchainApiController, OptionsController, TransactionsController } from '../../index.js'
import {
  ONRAMP_TRANSACTIONS_RESPONSES_FEB,
  ONRAMP_TRANSACTIONS_RESPONSES_JAN
} from '../constants/OnrampTransactions.js'
import type { Transaction } from '@web3modal/common'

// -- Constants ----------------------------------------------------------------
const projectId = '123'
OptionsController.state.projectId = projectId
const defaultState = {
  transactions: [],
  transactionsByYear: {},
  loading: false,
  empty: false,
  next: undefined,
  coinbaseTransactions: {}
}

// -- Tests --------------------------------------------------------------------
describe('TransactionsController', () => {
  it('should have valid default state', () => {
    expect(TransactionsController.state).toEqual(defaultState)
  })

  it('should fetch onramp transactions and group them appropiately', async () => {
    const accountAddress = ONRAMP_TRANSACTIONS_RESPONSES_JAN.SUCCESS.metadata.sentTo

    const response = {
      data: [
        ONRAMP_TRANSACTIONS_RESPONSES_JAN.SUCCESS,
        ONRAMP_TRANSACTIONS_RESPONSES_FEB.FAILED
      ] as Transaction[],
      next: ''
    }

    const fetchTransactions = vi
      .spyOn(BlockchainApiController, 'fetchTransactions')
      .mockResolvedValue(response)

    await TransactionsController.fetchTransactions(accountAddress, 'coinbase')

    expect(fetchTransactions).toHaveBeenCalledWith({
      account: accountAddress,
      projectId,
      onramp: 'coinbase',
      cursor: undefined
    })

    expect(TransactionsController.state.coinbaseTransactions).toEqual({
      2024: {
        0: [ONRAMP_TRANSACTIONS_RESPONSES_JAN.SUCCESS],
        1: [ONRAMP_TRANSACTIONS_RESPONSES_FEB.FAILED]
      }
    })
  })

  it('should update onramp transaction from pending to success', async () => {
    const { SUCCESS, IN_PROGRESS } = ONRAMP_TRANSACTIONS_RESPONSES_FEB
    const accountAddress = SUCCESS.metadata.sentTo
    TransactionsController.state.coinbaseTransactions = {}

    const pendingResponse = {
      data: [IN_PROGRESS] as Transaction[],
      next: ''
    }

    const fetchTransactions = vi
      .spyOn(BlockchainApiController, 'fetchTransactions')
      .mockResolvedValue(pendingResponse)

    await TransactionsController.fetchTransactions(accountAddress, 'coinbase')

    expect(fetchTransactions).toHaveBeenCalledWith({
      account: accountAddress,
      projectId,
      onramp: 'coinbase',
      cursor: undefined
    })

    expect(TransactionsController.state.coinbaseTransactions).toEqual({
      2024: {
        1: [IN_PROGRESS]
      }
    })

    // Update the transaction
    const successResponse = {
      data: [SUCCESS] as Transaction[],
      next: ''
    }

    fetchTransactions.mockResolvedValue(successResponse)

    await TransactionsController.fetchTransactions(accountAddress, 'coinbase')

    expect(fetchTransactions).toHaveBeenCalledWith({
      account: accountAddress,
      projectId,
      onramp: 'coinbase',
      cursor: undefined
    })

    // Transaction should be replaced
    expect(TransactionsController.state.coinbaseTransactions).toEqual({
      2024: {
        1: [SUCCESS]
      }
    })
  })
})
