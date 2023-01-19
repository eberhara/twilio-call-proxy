/* eslint-disable import/first */
const IORedisMock = jest.fn()
jest.mock('ioredis', () => ({
  __esModule: true,
  default: IORedisMock
}))

const envMock = { REDIS_HOST: 'foo.com' }
jest.mock('../../../../env', () => ({
  __esModule: true,
  default: envMock
}))

import { RemoteCache } from '../RemoteCache'

describe('Remote Cache', () => {
  const getMock = jest.fn()
  const mgetMock = jest.fn()
  const setMock = jest.fn()
  const delMock = jest.fn()
  const keysMock = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
    IORedisMock.mockReturnValue({
      get: getMock,
      mget: mgetMock,
      set: setMock,
      del: delMock,
      keys: keysMock
    })
  })

  it('exposes a singleton', async () => {
    expect(RemoteCache.getInstance()).toBe(RemoteCache.getInstance())
  })

  describe('setup', () => {
    describe('when redis host is not set', () => {
      it('throws an exception', async () => {
        envMock.REDIS_HOST = ''
        expect(RemoteCache.getInstance().setup).toThrow()
      })
    })

    describe('when redis host is set', () => {
      it('properly setup redis connection', async () => {
        envMock.REDIS_HOST = 'foo.com'
        RemoteCache.getInstance().setup()
        expect(IORedisMock).toBeCalledWith('foo.com')
      })
    })
  })

  describe('get', () => {
    beforeEach(() => {
      getMock.mockReturnValue('foo')
    })

    it('returns local cache data', async () => {
      const data = await RemoteCache.getInstance().get('some-key')
      expect(data).toBe('foo')
      expect(getMock).toHaveBeenCalledWith('some-key')
    })
  })

  describe('getMany', () => {
    beforeEach(() => {
      mgetMock.mockReturnValue({
        foo: 'bar', other: '456'
      })
    })

    it('returns local cache data', async () => {
      const data = await RemoteCache.getInstance().getMany(['foo', 'other'])
      expect(data).toEqual({ foo: 'bar', other: '456' })
      expect(mgetMock).toHaveBeenCalledWith(['foo', 'other'])
    })
  })

  describe('set', () => {
    beforeEach(() => {
      setMock.mockReturnValue(true)
    })

    describe('when ttl is provided', () => {
      it('properly stores data in cache following provided ttl', async () => {
        await RemoteCache.getInstance().set('foo', 'bar', 1000)
        expect(setMock).toHaveBeenCalledWith('foo', 'bar', 'EX', 1000)
      })
    })

    describe('when ttl is not provided', () => {
      it('properly stores data without a ttl (forever)', async () => {
        await RemoteCache.getInstance().set('foo', 'bar')
        expect(setMock).toHaveBeenCalledWith('foo', 'bar')
      })
    })
  })

  describe('del', () => {
    it('properly deletes the key', async () => {
      const deleted = await RemoteCache.getInstance().del('some-key')
      expect(deleted).toBe(true)
      expect(delMock).toHaveBeenCalledWith('some-key')
    })
  })

  describe('getAllKeysWithPrefix', () => {
    describe('when there are keys in storage', () => {
      beforeEach(() => {
        keysMock.mockReturnValue(['foo-1', 'foo-2'])
      })

      it('properly return all keys starting with a given prefix', async () => {
        const keys = await RemoteCache.getInstance().getAllKeysWithPrefix('foo')
        expect(keys).toEqual(['foo-1', 'foo-2'])
        expect(keysMock).toHaveBeenCalledWith('foo*')
      })
    })

    describe('when there are no keys in storage', () => {
      beforeEach(() => { keysMock.mockReturnValue([]) })

      it('returns an empty list', async () => {
        const keys = await RemoteCache.getInstance().getAllKeysWithPrefix('non-existing-prefix')
        expect(keys).toEqual([])
      })
    })
  })
})
