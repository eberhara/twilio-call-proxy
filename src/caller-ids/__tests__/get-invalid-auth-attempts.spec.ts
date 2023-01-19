/* eslint-disable import/first */
import { loggerMock } from '../../__tests__/mocks/logger'
jest.mock('../../infra/logger', () => loggerMock)

const getInvalidAuthAttemptsMock = jest.fn()
const CallerAuthAttemptsRepository = { getInvalidAuthAttempts: getInvalidAuthAttemptsMock }
jest.mock('../../infra/repositories', () => ({
  __esModule: true,
  CallerAuthAttemptsRepository: { getInstance: () => CallerAuthAttemptsRepository }
}))

import { getInvalidAuthAttempts } from '../'

describe('Caller IDs - Get invalid auth attempt', () => {
  const callerId = '+5551123456789'

  beforeEach(() => {
    jest.resetAllMocks()
    getInvalidAuthAttemptsMock.mockResolvedValue(5)
  })

  it('returns invalid auth attempts counter', async () => {
    const response = await getInvalidAuthAttempts(callerId)
    expect(response).toEqual(5)
  })
})
