/* eslint-disable import/first */
import { loggerMock } from '../../__tests__/mocks/logger'
jest.mock('../../infra/logger', () => loggerMock)

const findBlockedCallerMock = jest.fn()
const BlockedCallersRepository = {
  findBlockedCaller: findBlockedCallerMock
}
jest.mock('../../infra/repositories', () => ({
  __esModule: true,
  BlockedCallersRepository: {
    getInstance: () => BlockedCallersRepository
  }
}))

import { getBlockedCaller } from '../'

describe('Caller IDs - Get blocked caller', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('when the caller is an withheld number', () => {
    const callerId = '464'

    it('returns as blocked and withheld', async () => {
      const response = await getBlockedCaller(callerId)
      expect(response).toEqual({
        id: callerId,
        withheld: true
      })
    })
  })

  describe('when the caller is not an withheld number', () => {
    const callerId = '+5551123456789'

    beforeEach(() => {
      findBlockedCallerMock.mockResolvedValue({
        id: callerId,
        blockedOn: new Date().toISOString()
      })
    })

    it('checks whether the caller is blocked', async () => {
      const dataISOStringRegex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d/ // 2022-04-07T22:55:34.520Z
      const response = await getBlockedCaller(callerId)
      expect(response).toEqual({
        id: callerId,
        blockedOn: expect.stringMatching(dataISOStringRegex)
      })
    })
  })
})
