/* eslint-disable import/first */
import { loggerMock } from '../../__tests__/mocks/logger'
jest.mock('../../infra/logger', () => loggerMock)

const getMock = jest.fn()
const delMock = jest.fn()
const setMock = jest.fn()
const CacheInstanceMock = {
  get: getMock,
  del: delMock,
  set: setMock
}
jest.mock('../../infra/cache', () => ({
  __esModule: true,
  getCacheInstance: () => CacheInstanceMock
}))

import { ExecutionsRepository } from '../ExecutionsRepository'

describe('ExecutionsRepository', () => {
  const defaultTtl = 5
  let executions: ExecutionsRepository

  beforeEach(() => {
    jest.resetAllMocks()
    executions = ExecutionsRepository.getInstance()
  })

  describe('when an execution is added', () => {
    it('properly sends it to database', async () => {
      await executions.addExecution('id')
      expect(setMock).toBeCalledWith('executions-id', 'id', defaultTtl)
    })
  })

  describe('when an execution is deleted', () => {
    it('properly deletes it from database', async () => {
      await executions.removeExecution('id')
      expect(delMock).toBeCalledWith('executions-id')
    })
  })

  describe('when an execution is being checked', () => {
    describe('when it exists', () => {
      it('properly returns true', async () => {
        getMock.mockImplementation(() => Promise.resolve('id'))
        const exists = await executions.exists('id')
        expect(exists).toEqual(true)
        expect(getMock).toBeCalledWith('executions-id')
      })
    })

    describe('when it does not exist', () => {
      it('properly returns false', async () => {
        getMock.mockImplementation(() => Promise.resolve())
        const exists = await executions.exists('id')
        expect(exists).toEqual(false)
        expect(getMock).toBeCalledWith('executions-id')
      })
    })
  })
})
