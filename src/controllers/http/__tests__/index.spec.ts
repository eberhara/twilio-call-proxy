/* eslint-disable import/first */
const routerUseMock = jest.fn()
jest.mock('express', () => ({
  __esModule: true,
  Router: () => ({
    use: routerUseMock
  })
}))

const authAttemptsRouterMock = jest.fn()
jest.mock('../auth-attempts', () => ({
  __esModule: true,
  authAttemptsRouter: () => authAttemptsRouterMock
}))

const blockedCallersRouterMock = jest.fn()
jest.mock('../blocked-callers', () => ({
  __esModule: true,
  blockedCallersRouter: () => blockedCallersRouterMock
}))

const executionsRouterMock = jest.fn()
jest.mock('../executions', () => ({
  __esModule: true,
  executionsRouter: () => executionsRouterMock
}))

const pinRouterMock = jest.fn()
jest.mock('../pin', () => ({
  __esModule: true,
  pinRouter: () => pinRouterMock
}))

const defaultRouterMock = jest.fn()
jest.mock('../default', () => ({
  __esModule: true,
  defaultRouter: () => defaultRouterMock
}))

import { createHttpRouters } from '../'

describe('Http routers', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('creates /auth-attempts route', () => {
    createHttpRouters()
    expect(routerUseMock).toBeCalledWith('/auth-attempts', authAttemptsRouterMock)
  })

  it('creates /blocked-callers route', () => {
    createHttpRouters()
    expect(routerUseMock).toBeCalledWith('/blocked-callers', blockedCallersRouterMock)
  })

  it('creates /executions route', () => {
    createHttpRouters()
    expect(routerUseMock).toBeCalledWith('/executions', executionsRouterMock)
  })

  it('creates /validate-pin route', () => {
    createHttpRouters()
    expect(routerUseMock).toBeCalledWith('/validate-pin', pinRouterMock)
  })

  it('creates / route', () => {
    createHttpRouters()
    expect(routerUseMock).toBeCalledWith('/', defaultRouterMock)
  })
})
