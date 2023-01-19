/* eslint-disable import/first */
const logErrorMock = jest.fn()
jest.mock('../log', () => ({
  __esModule: true,
  logError: logErrorMock
}))
import { Request, Response, NextFunction } from 'express'

import { errorHandler } from '../error'

describe('Middlwares - Error Handler', () => {
  const requestMock = {} as unknown as Request
  const sendMock = jest.fn()
  const statusMock = jest.fn()
  const responseMock = { status: statusMock } as unknown as Response
  const nextMock = jest.fn() as unknown as NextFunction

  beforeEach(() => {
    jest.resetAllMocks()
    responseMock.headersSent = false
    statusMock.mockReturnValue({ send: sendMock })
  })

  describe('when response headers have already being transmitted', () => {
    it('simply follows the middleware chain', async () => {
      responseMock.headersSent = true
      errorHandler({ error: true }, requestMock, responseMock, nextMock)
      expect(nextMock).toBeCalledWith({ error: true })
      expect(statusMock).not.toBeCalled()
      expect(sendMock).not.toBeCalled()
    })
  })

  describe('when response headers were not transmitted yet', () => {
    it('logs error info', async () => {
      const error = { message: 'a-message' }
      errorHandler(error, requestMock, responseMock, nextMock)
      expect(logErrorMock).toBeCalledWith(requestMock, responseMock, 'a-message')
    })

    describe('when error code is provided', () => {
      it('sends it on http error code', async () => {
        const error = { httpErrorCode: 404 }
        errorHandler(error, requestMock, responseMock, nextMock)
        expect(statusMock).toBeCalledWith(404)
      })
    })

    describe('when error code is not provided', () => {
      it('sends a generic HTTP 500 on http error code', async () => {
        const error = {}
        errorHandler(error, requestMock, responseMock, nextMock)
        expect(statusMock).toBeCalledWith(500)
      })
    })

    describe('when error message is provided', () => {
      it('sends it on http response', async () => {
        const error = { message: 'error-message' }
        errorHandler(error, requestMock, responseMock, nextMock)
        expect(sendMock).toBeCalledWith({ message: 'error-message' })
      })
    })

    describe('when error message is not provided', () => {
      it('the entire error is serialized as string and used on http response', async () => {
        const error = { error: 'foo-bar' }
        errorHandler(error, requestMock, responseMock, nextMock)
        expect(sendMock).toBeCalledWith({ message: '{"error":"foo-bar"}' })
      })
    })
  })
})
