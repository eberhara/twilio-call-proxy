/* eslint-disable import/first */
import { loggerMock } from '../../__tests__/mocks/logger'
jest.mock('../../infra/logger', () => loggerMock)

const removeBlockedCallerMock = jest.fn()
const BlockedCallersRepository = { removeBlockedCaller: removeBlockedCallerMock }
jest.mock('../../infra/repositories', () => ({
  __esModule: true,
  BlockedCallersRepository: {
    getInstance: () => BlockedCallersRepository
  }
}))

const clearInvalidAuthAttemptsMock = jest.fn()
jest.mock('../clear-invalid-auth-attempts', () => ({
  __esModule: true,
  clearInvalidAuthAttempts: clearInvalidAuthAttemptsMock
}))

import { unblockCaller } from '../'

describe('Caller IDs - Unblock Caller', () => {
  const callerId = '+5551123456789'

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('properly unblocks a caller', async () => {
    await unblockCaller(callerId)
    expect(removeBlockedCallerMock).toHaveBeenCalledWith(callerId)
  })

  it('properly clears invalid auth attempts', async () => {
    await unblockCaller(callerId)
    expect(clearInvalidAuthAttemptsMock).toHaveBeenCalledWith(callerId)
  })
})
