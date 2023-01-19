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
const delMock = jest.fn()
const setMock = jest.fn()
const CacheInstanceMock = {
  get: getMock,
  del: delMock,
  set: setMock
}

jest.mock('../../cache', () => ({
  __esModule: true,
  getCacheInstance: () => CacheInstanceMock
}))

import { CallerAuthAttemptsRepository } from '../'

describe('CallerAuthAttemptsRepository', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('exposes a singleton', async () => {
    expect(CallerAuthAttemptsRepository.getInstance()).toBe(CallerAuthAttemptsRepository.getInstance())
  })

  describe('getInvalidAuthAttempts', () => {
    it('uses the proper key id to get data', async () => {
      await CallerAuthAttemptsRepository.getInstance().getInvalidAuthAttempts('123')
      expect(getMock).toHaveBeenCalledWith('auth-attempts-123')
    })

    describe('when it finds a value on database', () => {
      beforeEach(() => {
        getMock.mockResolvedValue('1')
      })

      it('returns the number of invalid auth attempts', async () => {
        const response = await CallerAuthAttemptsRepository.getInstance().getInvalidAuthAttempts('123')
        expect(response).toBe(1)
      })
    })

    describe('when it does not find a value on database', () => {
      beforeEach(() => {
        getMock.mockResolvedValue(null)
      })

      it('returns no data', async () => {
        const response = await CallerAuthAttemptsRepository.getInstance().getInvalidAuthAttempts('123')
        expect(response).toBe(undefined)
      })
    })
  })

  describe('clearInvalidAuthAttempts', () => {
    beforeEach(() => {
      delMock.mockResolvedValue(true)
    })

    it('uses the proper key id to delete data', async () => {
      await CallerAuthAttemptsRepository.getInstance().clearInvalidAuthAttempts('123')
      expect(delMock).toHaveBeenCalledWith('auth-attempts-123')
    })

    it('properly returns whether the data was deleted or not', async () => {
      const response = await CallerAuthAttemptsRepository.getInstance().clearInvalidAuthAttempts('123')
      expect(response).toBe(true)
    })
  })

  describe('upsert', () => {
    beforeEach(() => {
      setMock.mockResolvedValue(true)
    })

    it('uses the proper key id to save data', async () => {
      const invalidAuthAttempts = 2
      await CallerAuthAttemptsRepository.getInstance().upsert('123', invalidAuthAttempts)
      expect(setMock).toHaveBeenCalledWith('auth-attempts-123', invalidAuthAttempts, invalidAuthTtlKey)
    })

    it('properly returns whether the data was saved or not', async () => {
      const response = await CallerAuthAttemptsRepository.getInstance().upsert('123', 1)
      expect(response).toBe(true)
    })
  })
})
