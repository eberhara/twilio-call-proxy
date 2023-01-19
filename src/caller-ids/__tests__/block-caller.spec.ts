/* eslint-disable import/first */
import { loggerMock } from '../../__tests__/mocks/logger'
jest.mock('../../infra/logger', () => loggerMock)

const saveBlockedCallerMock = jest.fn()
const BlockedCallersRepository = { saveBlockedCaller: saveBlockedCallerMock }
jest.mock('../../infra/repositories', () => ({
  __esModule: true,
  BlockedCallersRepository: {
    getInstance: () => BlockedCallersRepository
  }
}))

import { blockCaller } from '../'

describe('Caller IDs - Block Caller', () => {
  const callerId = '+5551123456789'

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('properly blocks a caller', async () => {
    const dataISOStringRegex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d/ // 2022-04-07T22:55:34.520Z
    await blockCaller(callerId)

    expect(saveBlockedCallerMock).toHaveBeenCalledWith({
      id: callerId,
      blockedOn: expect.stringMatching(dataISOStringRegex)
    })
  })
})
