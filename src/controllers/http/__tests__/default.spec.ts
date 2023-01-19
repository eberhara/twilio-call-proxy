/* eslint-disable import/first */
import { loggerMock } from '../../../__tests__/mocks/logger'
jest.mock('../../../infra/logger', () => loggerMock)

const routerGetMock = jest.fn()
jest.mock('express', () => ({
  __esModule: true,
  Router: () => ({
    get: routerGetMock
  })
}))

import { Request, Response } from 'express'
import { indexHandler, defaultRouter } from '../default'

describe('Default http handler', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('Index', () => {
    it('returns a health check', () => {
      const requestMock = {} as unknown as Request
      const sendMock = jest.fn()
      const statusMock = jest.fn(() => ({ send: sendMock }))
      const responseMock = { status: statusMock } as unknown as Response
      indexHandler(requestMock, responseMock)
      expect(statusMock).toBeCalledWith(200)
      expect(sendMock).toBeCalledWith('200 OK')
    })
  })

  describe('Default router', () => {
    it('creates root route', () => {
      defaultRouter()
      expect(routerGetMock).toBeCalledWith('/', indexHandler)
    })
  })
})
