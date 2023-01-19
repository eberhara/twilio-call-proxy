/* eslint-disable import/first */
const NodeCacheMock = jest.fn()
jest.mock('node-cache', () => ({
  __esModule: true,
  default: NodeCacheMock
}))

import { LocalCache } from '../LocalCache'

describe('Local Cache', () => {
  const getMock = jest.fn()
  const mgetMock = jest.fn()
  const setMock = jest.fn()
  const delMock = jest.fn()
  const keysMock = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
    NodeCacheMock.mockReturnValue({
      get: getMock,
      mget: mgetMock,
      set: setMock,
      del: delMock,
      keys: keysMock
    })
  })

  it('exposes a singleton', async () => {
    expect(LocalCache.getInstance()).toBe(LocalCache.getInstance())
  })

  describe('get', () => {
    beforeEach(() => {
      getMock.mockReturnValue('foo')
    })

    it('returns local cache data', async () => {
      const data = await LocalCache.getInstance().get('some-key')
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
      const data = await LocalCache.getInstance().getMany(['foo', 'other'])
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
        await LocalCache.getInstance().set('foo', 'bar', 1000)
        expect(setMock).toHaveBeenCalledWith('foo', 'bar', 1000)
      })
    })

    describe('when ttl is not provided', () => {
      it('properly stores data in cache following default ttl', async () => {
        await LocalCache.getInstance().set('foo', 'bar')
        expect(setMock).toHaveBeenCalledWith('foo', 'bar', 31536000)
      })
    })
  })

  describe('del', () => {
    describe('when at least one item was deleted', () => {
      beforeEach(() => {
        delMock.mockReturnValue(1)
      })

      it('returns true', async () => {
        const deleted = await LocalCache.getInstance().del('some-key')
        expect(deleted).toBe(true)
        expect(delMock).toHaveBeenCalledWith('some-key')
      })
    })

    describe('when no item was deleted', () => {
      beforeEach(() => {
        delMock.mockReturnValue(0)
      })

      it('returns true', async () => {
        const deleted = await LocalCache.getInstance().del('some-key')
        expect(deleted).toBe(false)
        expect(delMock).toHaveBeenCalledWith('some-key')
      })
    })
  })

  describe('getAllKeysWithPrefix', () => {
    describe('when there are keys in local cache', () => {
      beforeEach(() => {
        keysMock.mockReturnValue(['foo-1', 'foo-2', 'other'])
      })

      it('properly return all keys starting with a given prefix', async () => {
        const keys = await LocalCache.getInstance().getAllKeysWithPrefix('foo')
        expect(keys).toEqual(['foo-1', 'foo-2'])
      })

      describe('when no key is found', () => {
        it('returns an empty list', async () => {
          const keys = await LocalCache.getInstance().getAllKeysWithPrefix('non-existing-prefix')
          expect(keys).toEqual([])
        })
      })
    })

    describe('when there are no keys in local cache', () => {
      beforeEach(() => { keysMock.mockReturnValue([]) })

      it('returns an empty list', async () => {
        const keys = await LocalCache.getInstance().getAllKeysWithPrefix('non-existing-prefix')
        expect(keys).toEqual([])
      })
    })
  })
})
