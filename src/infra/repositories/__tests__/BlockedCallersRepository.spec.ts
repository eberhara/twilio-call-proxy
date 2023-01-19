/* eslint-disable import/first */
const invalidAuthTtlKey = 100
const envMock = {
  INVALID_AUTH_ATTEMPTS_CACHE_TTL_SECONDS: invalidAuthTtlKey
}
jest.mock('../../../env', () => ({
  __esModule: true,
  default: envMock
}))

const getMock = jest.fn()
const getManyMock = jest.fn()
const getAllKeysWithPrefixMock = jest.fn()
const delMock = jest.fn()
const setMock = jest.fn()
const CacheInstanceMock = {
  get: getMock,
  getMany: getManyMock,
  getAllKeysWithPrefix: getAllKeysWithPrefixMock,
  del: delMock,
  set: setMock
}

jest.mock('../../cache', () => ({
  __esModule: true,
  getCacheInstance: () => CacheInstanceMock
}))

import { BlockedCallersRepository } from '../'

describe('BlockedCallersRepository', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('exposes a singleton', async () => {
    expect(BlockedCallersRepository.getInstance()).toBe(BlockedCallersRepository.getInstance())
  })

  describe('findBlockedCaller', () => {
    it('uses the proper key id to get data', async () => {
      await BlockedCallersRepository.getInstance().findBlockedCaller('123')
      expect(getMock).toHaveBeenCalledWith('blocked-callers-123')
    })

    describe('when it finds a value on database', () => {
      beforeEach(() => {
        getMock.mockResolvedValue('{"id":"123"}')
      })

      it('returns blocked caller information', async () => {
        const response = await BlockedCallersRepository.getInstance().findBlockedCaller('123')
        expect(response).toEqual({ id: '123' })
      })
    })

    describe('when it does not find a value on database', () => {
      beforeEach(() => {
        getMock.mockResolvedValue(null)
      })

      it('returns no data', async () => {
        const response = await BlockedCallersRepository.getInstance().findBlockedCaller('123')
        expect(response).toBe(undefined)
      })
    })
  })

  describe('removeBlockedCaller', () => {
    beforeEach(() => {
      delMock.mockResolvedValue(true)
    })

    it('uses the proper key id to delete data', async () => {
      await BlockedCallersRepository.getInstance().removeBlockedCaller('123')
      expect(delMock).toHaveBeenCalledWith('blocked-callers-123')
    })

    it('properly returns whether the data was deleted or not', async () => {
      const response = await BlockedCallersRepository.getInstance().removeBlockedCaller('123')
      expect(response).toBe(true)
    })
  })

  describe('saveBlockedCaller', () => {
    beforeEach(() => {
      setMock.mockResolvedValue(true)
    })

    it('uses the proper key id to save data', async () => {
      await BlockedCallersRepository.getInstance().saveBlockedCaller({ id: '123' })
      expect(setMock).toHaveBeenCalledWith('blocked-callers-123', '{"id":"123"}')
    })

    it('properly returns whether the data was saved or not', async () => {
      const response = await BlockedCallersRepository.getInstance().saveBlockedCaller({ id: '123' })
      expect(response).toBe(true)
    })
  })

  describe('listBlockedCallers', () => {
    describe('when the list of keys is undefined', () => {
      beforeEach(() => {
        getAllKeysWithPrefixMock.mockResolvedValue(undefined)
      })

      it('returns an empty list', async () => {
        const list = await BlockedCallersRepository.getInstance().listBlockedCallers()
        expect(list).toEqual([])
      })
    })

    describe('when the list of keys is empty', () => {
      beforeEach(() => {
        getAllKeysWithPrefixMock.mockResolvedValue([])
      })

      it('returns an empty list', async () => {
        const list = await BlockedCallersRepository.getInstance().listBlockedCallers()
        expect(list).toEqual([])
      })
    })

    describe('when the list of keys is not empty', () => {
      beforeEach(() => {
        getAllKeysWithPrefixMock.mockResolvedValue(['123', '456', '789'])
        getManyMock.mockResolvedValue({ 123: '{"id":"123"}', 456: undefined, 789: '' })
      })

      it('returns list of blocked callers', async () => {
        const list = await BlockedCallersRepository.getInstance().listBlockedCallers()
        expect(list).toEqual([{ id: '123' }])
      })
    })
  })
})
