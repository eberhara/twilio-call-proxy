/* eslint-disable import/first */
import { loggerMock } from '../../__tests__/mocks/logger'
jest.mock('../../infra/logger', () => loggerMock)

const validatePinMock = jest.fn()
const AuthPinsRepository = { validatePin: validatePinMock }
jest.mock('../../infra/repositories', () => ({
  __esModule: true,
  AuthPinsRepository: {
    getInstance: () => AuthPinsRepository
  }
}))

const invalidAuthAttemptMock = jest.fn()
const clearInvalidAuthAttemptsMock = jest.fn()
jest.mock('../../caller-ids', () => ({
  __esModule: true,
  clearInvalidAuthAttempts: clearInvalidAuthAttemptsMock,
  invalidAuthAttempt: invalidAuthAttemptMock
}))

import { pinValidation } from '../'

describe('Auth Pins - Validation', () => {
  const pin = '123'
  const callerId = '+5551123456789'

  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('when pin is valid', () => {
    const authenticatedResponse = {
      authenticated: true,
      backendIds: 'ids-string',
      backendHosts: 'hosts-string'
    }

    beforeEach(() => {
      jest.resetAllMocks()
      validatePinMock.mockResolvedValue(authenticatedResponse)
    })

    it('returns proper authentication information', async () => {
      const response = await pinValidation(pin, callerId)
      expect(response).toEqual(authenticatedResponse)
    })

    it('clears the counter of previous invalid attempts', async () => {
      await pinValidation(pin, callerId)
      expect(clearInvalidAuthAttemptsMock).toHaveBeenCalledWith(callerId)
    })
  })

  describe('when pin is not valid', () => {
    beforeEach(() => {
      jest.resetAllMocks()
      validatePinMock.mockResolvedValue({ authenticated: false })
      invalidAuthAttemptMock.mockResolvedValue({
        id: callerId,
        attempts: 1,
        blocked: true
      })
    })

    it('triggers invalid auth attempt and increments counter', async () => {
      await pinValidation(pin, callerId)
      expect(invalidAuthAttemptMock).toHaveBeenCalledWith(callerId)
    })

    it('returns proper unauthenticated information', async () => {
      const response = await pinValidation(pin, callerId)
      expect(response).toEqual({
        authenticated: false,
        attempts: {
          blocked: true,
          attempts: 1,
          id: callerId
        },
        blocked: true
      })
    })
  })
})
