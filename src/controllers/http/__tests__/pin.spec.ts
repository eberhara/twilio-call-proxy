/* eslint-disable import/first */
const validateRequestMock = jest.fn()
jest.mock('../../../infra/middlewares', () => ({
  __esModule: true,
  validateRequest: validateRequestMock
}))

const pinValidationMock = jest.fn()
jest.mock('../../../auth-pins', () => ({
  __esModule: true,
  pinValidation: pinValidationMock
}))

const routerPostMock = jest.fn()
const routerUseMock = jest.fn()
jest.mock('express', () => ({
  __esModule: true,
  Router: () => ({
    post: routerPostMock,
    use: routerUseMock
  })
}))

import { Request, Response } from 'express'
import { pinRouter, validatePinHandler } from '../pin'

describe('Pin handler', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('Validate Pin Handler', () => {
    const pinResponse = { authenticated: false }
    const pin = '123'
    const callerId = '456'
    beforeEach(() => {
      pinValidationMock.mockResolvedValue(pinResponse)
    })

    it('adds auth attempt and returns status of 201 (created)', async () => {
      const requestMock = { body: { callerId, pin } } as unknown as Request
      const sendMock = jest.fn()
      const statusMock = jest.fn(() => ({ send: sendMock }))
      const responseMock = { status: statusMock } as unknown as Response

      await validatePinHandler(requestMock, responseMock)
      expect(statusMock).toBeCalledWith(200)
      expect(sendMock).toBeCalledWith(pinResponse)
      expect(pinValidationMock).toHaveBeenCalledWith(pin, callerId)
    })
  })

  describe('Router', () => {
    it('uses request validation middleware', () => {
      pinRouter()
      expect(validateRequestMock).toBeCalledWith({ protocol: 'https' })
    })

    it('creates / post route', () => {
      pinRouter()
      expect(routerPostMock).toBeCalledWith('/', validatePinHandler)
    })
  })
})
