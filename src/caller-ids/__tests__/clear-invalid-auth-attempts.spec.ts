/* eslint-disable import/first */
import { loggerMock } from '../../__tests__/mocks/logger'
jest.mock('../../infra/logger', () => loggerMock)

const sclearInvalidAuthAttemptsrMock = jest.fn()
const CallerAuthAttemptsRepository = { clearInvalidAuthAttempts: sclearInvalidAuthAttemptsrMock }
jest.mock('../../infra/repositories', () => ({
  __esModule: true,
  CallerAuthAttemptsRepository: {
    getInstance: () => CallerAuthAttemptsRepository
  }
}))

import { clearInvalidAuthAttempts } from '../'

describe('Caller IDs - Clear invalid auth attempts', () => {
  const callerId = '+5551123456789'

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('properly blocks a caller', async () => {
    await clearInvalidAuthAttempts(callerId)
    expect(sclearInvalidAuthAttemptsrMock).toHaveBeenCalledWith(callerId)
  })
})
