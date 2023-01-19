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

jest.mock('../../../executions', () => ({
  __esModule: true,
  isExecutionConnected: (id: string) => Promise.resolve(id === 'EXISTING_ID')
}))

import { Request, Response } from 'express'
import { executionStatusHandler, executionsRouter } from '../executions'

describe('Executions http handler', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('Handler', () => {
    describe('when execution id exists', () => {
      it('returns status of 200 (found)', async () => {
        const requestMock = {
          params: { executionId: 'EXISTING_ID' }
        } as unknown as Request
        const sendStatusMock = jest.fn()
        const responseMock = { sendStatus: sendStatusMock } as unknown as Response
        await executionStatusHandler(requestMock, responseMock)
        expect(sendStatusMock).toBeCalledWith(200)
      })
    })

    describe('when execution id does not exist', () => {
      it('returns status of 410 (gone)', async () => {
        const requestMock = {
          params: { executionId: 'NON_EXISTING_ID' }
        } as unknown as Request
        const sendStatusMock = jest.fn()
        const responseMock = { sendStatus: sendStatusMock } as unknown as Response
        await executionStatusHandler(requestMock, responseMock)
        expect(sendStatusMock).toBeCalledWith(410)
      })
    })
  })

  describe('Router', () => {
    it('creates /:executionId/connected route', () => {
      executionsRouter()
      expect(routerGetMock).toBeCalledWith('/:executionId/connected', executionStatusHandler)
    })
  })
})
