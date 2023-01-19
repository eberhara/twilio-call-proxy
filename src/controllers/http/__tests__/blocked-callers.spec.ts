/* eslint-disable import/first */
const envMock = {
  ENABLE_DEBUG_ROUTES: true,
  SERVER_API_KEY: 'key'
}
jest.mock('../../../env', () => ({
  __esModule: true,
  default: envMock
}))

const validateRequestMock = jest.fn()
const validateHeaderMock = jest.fn()
jest.mock('../../../infra/middlewares', () => ({
  __esModule: true,
  validateRequest: validateRequestMock,
  validateHeader: validateHeaderMock
}))

const getBlockedCallerMock = jest.fn()
const blockCallerMock = jest.fn()
const unblockCallerMock = jest.fn()
const listBlockedCallersMock = jest.fn()
jest.mock('../../../caller-ids', () => ({
  __esModule: true,
  getBlockedCaller: getBlockedCallerMock,
  blockCaller: blockCallerMock,
  listBlockedCallers: listBlockedCallersMock,
  unblockCaller: unblockCallerMock
}))

const routerDelMock = jest.fn()
const routerGetMock = jest.fn()
const routerPostMock = jest.fn()
jest.mock('express', () => ({
  __esModule: true,
  Router: () => ({
    delete: routerDelMock,
    get: routerGetMock,
    post: routerPostMock
  })
}))

import { Request, Response } from 'express'
import { blockedCallersRouter, listHandler, unblockCallerHandler, blockCallerHandler, getBlockedCallerHandler } from '../blocked-callers'

describe('Blocked callers http handler', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('Unblock Caller Handler', () => {
    describe('when there is a caller deleted', () => {
      beforeEach(() => {
        unblockCallerMock.mockResolvedValue(true)
      })

      it('returns 204 (no content)', async () => {
        const requestMock = { params: { callerId: '123' } } as unknown as Request
        const sendStatusMock = jest.fn()
        const responseMock = { sendStatus: sendStatusMock } as unknown as Response
        await unblockCallerHandler(requestMock, responseMock)
        expect(sendStatusMock).toBeCalledWith(204)
      })
    })

    describe('when there is not a caller deleted', () => {
      beforeEach(() => {
        unblockCallerMock.mockResolvedValue(false)
      })

      it('returns 404 (not found)', async () => {
        const requestMock = { params: { callerId: '123' } } as unknown as Request
        const sendStatusMock = jest.fn()
        const responseMock = { sendStatus: sendStatusMock } as unknown as Response
        await unblockCallerHandler(requestMock, responseMock)
        expect(sendStatusMock).toBeCalledWith(404)
      })
    })
  })

  describe('Block Caller Handler', () => {
    it('properly blocks the caller and returns 201 (created)', async () => {
      const requestMock = { params: { callerId: '123' } } as unknown as Request
      const sendStatusMock = jest.fn()
      const responseMock = { sendStatus: sendStatusMock } as unknown as Response
      await blockCallerHandler(requestMock, responseMock)
      expect(sendStatusMock).toBeCalledWith(201)
      expect(blockCallerMock).toHaveBeenCalledWith('123')
    })
  })

  describe('Get Blocked Caller Handler', () => {
    describe('when callerId is not provided', () => {
      it('returns caller as blocked and 200 (found)', async () => {
        const requestMock = { params: {} } as unknown as Request
        const sendMock = jest.fn()
        const statusMock = jest.fn(() => ({ send: sendMock }))
        const responseMock = { status: statusMock } as unknown as Response

        await getBlockedCallerHandler(requestMock, responseMock)
        expect(statusMock).toBeCalledWith(200)
        expect(sendMock).toBeCalledWith({ blocked: true })
      })
    })

    describe('when callerId is provided', () => {
      describe('and the caller id is blocked', () => {
        beforeEach(() => { getBlockedCallerMock.mockResolvedValue({ id: '123' }) })

        it('returns blocked caller information and 200 (found)', async () => {
          const requestMock = { params: { callerId: '123' } } as unknown as Request
          const sendMock = jest.fn()
          const statusMock = jest.fn(() => ({ send: sendMock }))
          const responseMock = { status: statusMock } as unknown as Response

          await getBlockedCallerHandler(requestMock, responseMock)
          expect(statusMock).toBeCalledWith(200)
          expect(sendMock).toBeCalledWith({ id: '123', blocked: true })
        })
      })

      describe('and the caller id is not blocked', () => {
        beforeEach(() => { getBlockedCallerMock.mockResolvedValue(undefined) })

        it('returns 404 (not found)', async () => {
          const requestMock = { params: { callerId: '123' } } as unknown as Request
          const sendStatusMock = jest.fn()
          const responseMock = { sendStatus: sendStatusMock } as unknown as Response
          await getBlockedCallerHandler(requestMock, responseMock)
          expect(sendStatusMock).toBeCalledWith(404)
        })
      })
    })
  })

  describe('List Blocked Callers Handler', () => {
    beforeEach(() => {
      listBlockedCallersMock.mockReturnValue([{ id: '123' }])
    })

    it('returns the list of blocked callers and 200 (found)', async () => {
      const requestMock = {} as unknown as Request
      const sendMock = jest.fn()
      const statusMock = jest.fn(() => ({ send: sendMock }))
      const responseMock = { status: statusMock } as unknown as Response

      await listHandler(requestMock, responseMock)
      expect(statusMock).toBeCalledWith(200)
      expect(sendMock).toBeCalledWith({ data: [{ id: '123' }] })
    })
  })

  describe('Router', () => {
    const validateHeaderMiddlewareReturn = 'validateHeader'
    const validateRequestMiddlewareReturn = 'validateHeader'
    beforeEach(() => {
      validateHeaderMock.mockReturnValue(validateHeaderMiddlewareReturn)
      validateRequestMock.mockReturnValue(validateRequestMiddlewareReturn)
    })

    describe('when debug routes are enabled', () => {
      it('creates /:callerId post route', () => {
        envMock.ENABLE_DEBUG_ROUTES = true
        blockedCallersRouter()
        expect(routerPostMock).toBeCalledWith('/:callerId', blockCallerHandler)
      })
    })

    describe('when debug routes are not enabled', () => {
      it('does not create /:callerId post route', () => {
        envMock.ENABLE_DEBUG_ROUTES = false
        blockedCallersRouter()
        expect(routerPostMock).not.toBeCalledWith('/:callerId', blockCallerHandler)
      })
    })

    it('creates /:callerId get route', () => {
      blockedCallersRouter()
      expect(routerGetMock).toBeCalledWith('/:callerId', validateRequestMiddlewareReturn, getBlockedCallerHandler)
      expect(validateRequestMock).toBeCalledTimes(1)
      expect(validateRequestMock).toBeCalledWith({ protocol: 'https' })
    })

    it('creates /:callerId delete route', () => {
      blockedCallersRouter()
      expect(routerDelMock).toBeCalledWith('/:callerId', validateHeaderMiddlewareReturn, unblockCallerHandler)
      expect(validateHeaderMock).toBeCalledTimes(1)
      expect(validateHeaderMock).toBeCalledWith('apiKey', envMock.SERVER_API_KEY)
    })

    it('creates / route', () => {
      blockedCallersRouter()
      expect(routerGetMock).toBeCalledWith('/', validateHeaderMiddlewareReturn, listHandler)
      expect(validateHeaderMock).toBeCalledTimes(1)
      expect(validateHeaderMock).toBeCalledWith('apiKey', envMock.SERVER_API_KEY)
    })
  })
})
