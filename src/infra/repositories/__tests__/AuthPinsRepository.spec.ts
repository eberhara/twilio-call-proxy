/* eslint-disable import/first */

const validatePinMock = jest.fn()
jest.mock('../../api/server-api', () => ({
  __esModule: true,
  validatePin: validatePinMock
}))

import { AuthPinsRepository } from '../'

describe('AuthPinsRepository', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('exposes a singleton', async () => {
    expect(AuthPinsRepository.getInstance()).toBe(AuthPinsRepository.getInstance())
  })

  describe('pin validation', () => {
    describe('when pin is valid', () => {
      beforeEach(() => {
        validatePinMock.mockResolvedValue({
          authenticated: true,
          backendIds: [1],
          backendHosts: ['foo.com']
        })
      })

      it('returns authenticated response', async () => {
        const response = await AuthPinsRepository.getInstance().validatePin('123')
        expect(response).toEqual({
          authenticated: true,
          backendIds: '[1]',
          backendHosts: '["foo.com"]'
        })
      })
    })

    describe('when pin is not valid', () => {
      beforeEach(() => {
        validatePinMock.mockResolvedValue({ authenticated: false })
      })

      it('returns unauthenticated response', async () => {
        const response = await AuthPinsRepository.getInstance().validatePin('321')
        expect(response).toEqual({ authenticated: false })
      })
    })
  })
})
