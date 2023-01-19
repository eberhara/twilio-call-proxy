/* eslint-disable import/first */
import { loggerMock } from '../../../__tests__/mocks/logger'
jest.mock('../../../infra/logger', () => loggerMock)

const routerUseMock = jest.fn()
const routerWsMock = jest.fn()
jest.mock('express', () => ({
  __esModule: true,
  Router: () => ({
    use: routerUseMock,
    ws: routerWsMock
  })
}))

const websocketStreamMock = jest.fn()
jest.mock('websocket-stream', () => ({
  __esModule: true,
  default: websocketStreamMock
}))

const validateRequestMock = jest.fn()
jest.mock('../../../infra/middlewares/validate-request', () => ({
  __esModule: true,
  validateRequest: validateRequestMock
}))

const messageStreamMock = jest.fn()
jest.mock('../../../streams/message', () => ({
  __esModule: true,
  messageStream: messageStreamMock
}))

import * as WebSocket from 'ws'
import { websocketHandler, mediaRouter, handleStreamError } from '../media-stream'

describe('Media stream websocket handler', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('Media stream websocket handler', () => {
    const ws = { on: jest.fn() } as unknown as WebSocket
    const customMessageStreamMock = jest.fn()
    const streamOnMock = jest.fn()
    const streamPipeMock = jest.fn()
    const websocketStreamCustomMock = {
      on: (...args: any[]) => {
        streamOnMock(...args)
        return websocketStreamCustomMock
      },
      pipe: (...args: any[]) => {
        streamPipeMock(...args)
        return websocketStreamCustomMock
      }
    }

    beforeEach(() => {
      jest.resetAllMocks()
      websocketStreamMock.mockImplementation(() => (websocketStreamCustomMock))
      messageStreamMock.mockImplementation(() => customMessageStreamMock)
    })

    it('transforms websocket connection into a stream', () => {
      websocketHandler(ws)
      expect(websocketStreamMock).toBeCalledWith(ws)
    })

    it('creates message parser stream', () => {
      websocketHandler(ws)
      expect(messageStreamMock).toBeCalledWith(ws, expect.any(Function))
    })

    describe('Websocket and message parser streams setup', () => {
      it('connects websocket and message parser streams', () => {
        websocketHandler(ws)
        expect(streamPipeMock).toBeCalledWith(customMessageStreamMock)
      })

      it('handles error properly websocket and message parser streams', () => {
        websocketHandler(ws)
        expect(streamOnMock).toBeCalledWith('error', expect.any(Function))
      })
    })
  })

  describe('Media stream router', () => {
    it('adds request validation layer properly', () => {
      mediaRouter()
      expect(routerWsMock).toBeCalledWith('/', websocketHandler)
    })

    it('creates root websocket route', () => {
      validateRequestMock.mockImplementation(() => ({ mock: 'validateRequest' }))
      mediaRouter()
      expect(validateRequestMock).toBeCalledWith(expect.objectContaining({ protocol: 'wss', url: '/media' }))
      expect(routerUseMock).toBeCalledWith({ mock: 'validateRequest' })
    })
  })

  describe('Stream error handler', () => {
    it('closes websocket connection', () => {
      const wsCloseMock = jest.fn()
      const wsMock = { close: wsCloseMock } as unknown as WebSocket
      handleStreamError(wsMock)(new Error('Some error'))
      expect(wsCloseMock).toBeCalled()
    })
  })
})
