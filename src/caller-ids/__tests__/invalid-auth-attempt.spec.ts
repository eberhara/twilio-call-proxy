/* eslint-disable import/first */
import { loggerMock } from '../../__tests__/mocks/logger'
jest.mock('../../infra/logger', () => loggerMock)

const envMock = {
  INVALID_AUTH_ATTEMPTS_ALLOWED: 9
}
jest.mock('../../env', () => ({
  __esModule: true,
  default: envMock
}))

const getInvalidAuthAttemptsMock = jest.fn()
const invalidAuthUpsertMock = jest.fn()
const CallerAuthAttemptsRepository = {
  getInvalidAuthAttempts: getInvalidAuthAttemptsMock,
  upsert: invalidAuthUpsertMock
}
jest.mock('../../infra/repositories', () => ({
  __esModule: true,
  CallerAuthAttemptsRepository: {
    getInstance: () => CallerAuthAttemptsRepository
  }
}))

const blockCallerMock = jest.fn()
jest.mock('../block-caller', () => ({
  __esModule: true,
  blockCaller: blockCallerMock
}))

import { invalidAuthAttempt } from '../'

describe('Caller IDs - Invalid auth attempt', () => {
  const callerId = '+5551123456789'

  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('increamenting invalid auth attempts', () => {
    describe('when it is the first invalid auth attempt', () => {
      beforeEach(() => {
        getInvalidAuthAttemptsMock.mockResolvedValue(undefined)
      })

      it('starts the auth attempts counter', async () => {
        await invalidAuthAttempt(callerId)
        expect(invalidAuthUpsertMock).toHaveBeenCalledWith(callerId, 1)
      })
    })

    describe('when it is not the first invalid auth attempt', () => {
      beforeEach(() => {
        getInvalidAuthAttemptsMock.mockResolvedValue(2)
      })

      it('increments the auth attempts counter', async () => {
        await invalidAuthAttempt(callerId)
        expect(invalidAuthUpsertMock).toHaveBeenCalledWith(callerId, 3)
      })
    })
  })

  describe('blocking caller', () => {
    describe('when the number of auth attempts is below the threshold allowed', () => {
      beforeEach(() => {
        getInvalidAuthAttemptsMock.mockResolvedValue(5)
      })

      it('does not block the caller', async () => {
        const response = await invalidAuthAttempt(callerId)
        expect(blockCallerMock).not.toHaveBeenCalled()
        expect(response).toEqual({
          id: callerId,
          attempts: 6,
          blocked: false
        })
      })
    })

    describe('when the number of auth attempts reaches the threshold allowed', () => {
      beforeEach(() => {
        getInvalidAuthAttemptsMock.mockResolvedValue(9)
      })

      it('blocks the caller', async () => {
        const response = await invalidAuthAttempt(callerId)
        expect(blockCallerMock).toBeCalledWith(callerId)
        expect(response).toEqual({
          id: callerId,
          attempts: 10,
          blocked: true
        })
      })
    })
  })
})
