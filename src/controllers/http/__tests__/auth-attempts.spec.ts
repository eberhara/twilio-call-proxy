/* eslint-disable import/first */
const envMock = { ENABLE_DEBUG_ROUTES: true }
jest.mock('../../../env', () => ({
  __esModule: true,
  default: envMock
}))

const getInvalidAuthAttemptsMock = jest.fn()
const invalidAuthAttemptMock = jest.fn()
jest.mock('../../../caller-ids', () => ({
  __esModule: true,
  getInvalidAuthAttempts: getInvalidAuthAttemptsMock,
  invalidAuthAttempt: invalidAuthAttemptMock
}))

const routerGetMock = jest.fn()
const routerPostMock = jest.fn()
jest.mock('express', () => ({
  __esModule: true,
  Router: () => ({
    get: routerGetMock,
    post: routerPostMock
  })
}))

import { Request, Response } from 'express'
import { authAttemptHandler, getAuthAttemptHandler, authAttemptsRouter } from '../auth-attempts'

describe('Auth attempts http handler', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('Create Auth Attempt Handler', () => {
    const authAttemptResponse = {
      id: '123',
      attempts: 1,
      blocked: false
    }

    beforeEach(() => {
      invalidAuthAttemptMock.mockResolvedValue(authAttemptResponse)
    })

    it('adds auth attempt and returns status of 201 (created)', async () => {
      const requestMock = { params: { callerId: '123' } } as unknown as Request
      const sendMock = jest.fn()
      const statusMock = jest.fn(() => ({ send: sendMock }))
      const responseMock = { status: statusMock } as unknown as Response

      await authAttemptHandler(requestMock, responseMock)
      expect(statusMock).toBeCalledWith(201)
      expect(sendMock).toBeCalledWith(authAttemptResponse)
    })
  })

  describe('Get Auth Attempts Handler', () => {
    describe('when there are attempts', () => {
      beforeEach(() => {
        getInvalidAuthAttemptsMock.mockResolvedValue(1)
      })

      it('returns auth attempts counter and 200 (found)', async () => {
        const requestMock = { params: { callerId: '123' } } as unknown as Request
        const sendMock = jest.fn()
        const statusMock = jest.fn(() => ({ send: sendMock }))
        const responseMock = { status: statusMock } as unknown as Response

        await getAuthAttemptHandler(requestMock, responseMock)
        expect(statusMock).toBeCalledWith(200)
        expect(sendMock).toBeCalledWith({ attempts: 1 })
      })
    })

    describe('when there are no attempts', () => {
      beforeEach(() => { getInvalidAuthAttemptsMock.mockResolvedValue(undefined) })

      it('returns 404 (not found)', async () => {
        const requestMock = { params: { callerId: '123' } } as unknown as Request
        const sendStatusMock = jest.fn()
        const responseMock = { sendStatus: sendStatusMock } as unknown as Response
        await getAuthAttemptHandler(requestMock, responseMock)
        expect(sendStatusMock).toBeCalledWith(404)
      })
    })
  })

  describe('Router', () => {
    describe('when debug routes are enabled', () => {
      it('creates /:callerId post route', () => {
        envMock.ENABLE_DEBUG_ROUTES = true
        authAttemptsRouter()
        expect(routerPostMock).toBeCalledWith('/:callerId', authAttemptHandler)
      })

      it('creates /:callerId get route', () => {
        envMock.ENABLE_DEBUG_ROUTES = true
        authAttemptsRouter()
        expect(routerGetMock).toBeCalledWith('/:callerId', getAuthAttemptHandler)
      })
    })

    describe('when debug routes are not enabled', () => {
      it('does not create /:callerId post route', () => {
        envMock.ENABLE_DEBUG_ROUTES = false
        authAttemptsRouter()
        expect(routerPostMock).not.toBeCalledWith('/:callerId', authAttemptHandler)
      })

      it('does not create /:callerId get route', () => {
        envMock.ENABLE_DEBUG_ROUTES = false
        authAttemptsRouter()
        expect(routerGetMock).not.toBeCalledWith('/:callerId', getAuthAttemptHandler)
      })
    })
  })
})
