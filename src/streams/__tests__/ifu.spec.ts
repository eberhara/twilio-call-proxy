import env from '../../env'

/* eslint-disable import/first */
const WebSocketClientMock = jest.fn()
const createWebSocketStreamMock = jest.fn()

jest.mock('ws', () => ({
  __esModule: true,
  default: WebSocketClientMock,
  createWebSocketStream: createWebSocketStreamMock
}))

import { createBackendStream } from '../create-backend-stream'

describe('Create Backend stream', () => {
  const backendHost = '0.0.0.0'

  beforeEach(() => { jest.resetAllMocks() })

  it('creates a websocket connection to backend host', () => {
    createBackendStream(backendHost)
    expect(WebSocketClientMock).toBeCalledWith(expect.stringContaining(`ws://0.0.0.0:${env.BACKEND_WS_API_PORT}/media`))
  })

  it('returns a stream of a websocket connection', () => {
    createBackendStream(backendHost)
    expect(createWebSocketStreamMock).toBeCalled()
  })
})
