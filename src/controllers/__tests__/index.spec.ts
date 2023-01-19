/* eslint-disable import/first */
const routerUseMock = jest.fn()
jest.mock('express', () => ({
  __esModule: true,
  Router: () => ({
    use: routerUseMock
  })
}))

const httpRouterMock = jest.fn()
jest.mock('../http', () => ({
  __esModule: true,
  createHttpRouters: () => httpRouterMock
}))

const wsRouterMock = jest.fn()
jest.mock('../websocket', () => ({
  __esModule: true,
  createWsRouters: () => wsRouterMock
}))

import { createRouters } from '../'

describe('Routers', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('creates http routers', () => {
    createRouters()
    expect(routerUseMock).toBeCalledWith(httpRouterMock)
  })

  it('creates websocket routers', () => {
    createRouters()
    expect(routerUseMock).toBeCalledWith(wsRouterMock)
  })
})
