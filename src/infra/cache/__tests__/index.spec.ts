/* eslint-disable import/first */
import { loggerMock } from '../../../__tests__/mocks/logger'
jest.mock('../../logger', () => loggerMock)

const envMock = {
  REMOTE_CACHE_ENABLED: false
}

const LocalCacheMock = {
  type: 'local'
}

const RemoteCacheMock = {
  type: 'remote',
  setup: jest.fn()
}

jest.mock('../../../env', () => ({
  __esModule: true,
  default: envMock
}))

jest.mock('../implementations/LocalCache', () => ({
  __esModule: true,
  LocalCache: { getInstance: () => LocalCacheMock }
}))

jest.mock('../implementations/RemoteCache', () => ({
  __esModule: true,
  RemoteCache: { getInstance: () => RemoteCacheMock }
}))

import { getCacheInstance, cacheSetup } from '../'

describe('Cache', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('getCacheInstance', () => {
    describe('when remote cache is enabled', () => {
      it('returns remote cache instance', () => {
        envMock.REMOTE_CACHE_ENABLED = true
        const cache = getCacheInstance() as any
        expect(cache.type).toEqual('remote')
      })
    })

    describe('when remote cache is disabled', () => {
      it('returns local cache instance', () => {
        envMock.REMOTE_CACHE_ENABLED = false
        const cache = getCacheInstance() as any
        expect(cache.type).toEqual('local')
      })
    })
  })

  describe('cacheSetup', () => {
    describe('when remote cache is enabled', () => {
      it('calls setup method', () => {
        envMock.REMOTE_CACHE_ENABLED = true
        cacheSetup()
        expect(RemoteCacheMock.setup).toBeCalledTimes(1)
      })
    })

    describe('when remote cache is disabled', () => {
      it('does not call setup method', () => {
        envMock.REMOTE_CACHE_ENABLED = false
        cacheSetup()
        expect(RemoteCacheMock.setup).toBeCalledTimes(0)
      })
    })
  })
})
