/* eslint-disable import/first */
const routerUseMock = jest.fn()
jest.mock('express', () => ({
  __esModule: true,
  Router: () => ({
    use: routerUseMock
  })
}))

const mediaStreamRouterMock = jest.fn()
jest.mock('../media-stream', () => ({
  __esModule: true,
  mediaRouter: () => mediaStreamRouterMock
}))

import { createWsRouters } from '../'

describe('Websocket routers', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('creates /media route', () => {
    createWsRouters()
    expect(routerUseMock).toBeCalledWith('/media', mediaStreamRouterMock)
  })
})
