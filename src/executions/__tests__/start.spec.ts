/* eslint-disable import/first */
import { loggerMock } from '../../__tests__/mocks/logger'
jest.mock('../../infra/logger', () => loggerMock)

const addExecutionMock = jest.fn()
const existsMock = jest.fn()
const ExecutionsRepository = {
  addExecution: addExecutionMock,
  exists: existsMock
}
jest.mock('../ExecutionsRepository', () => ({
  __esModule: true,
  ExecutionsRepository: {
    getInstance: () => ExecutionsRepository
  }
}))

jest.useFakeTimers()

import { startExecution } from '../'

describe('Executions - start', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  describe('when an execution starts', () => {
    it('properly saves it', async () => {
      await startExecution('id')
      expect(addExecutionMock).toBeCalledWith('id')
    })

    it('recurrently checks for existing execution id every 4s', async () => {
      existsMock
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false)

      await startExecution('id')
      /**
       * "addExecution" is called 1 time in synchronous part of the algorithm
       * We clear the mock so the test keep checking on the recurring part of the algorithm
       */
      expect(addExecutionMock).toHaveBeenCalledTimes(1)
      addExecutionMock.mockClear()

      /**
       * This minor hack is needed so we run all fake timers and all ticks, callbacks, promises between one timer and others
       */
      for (let i = 0; i < 10; i++) {
        await Promise.resolve()
        jest.runAllTimers()
        await Promise.resolve()
      }

      /**
       * Checks whether execution exists for 3 times (true, true, false)
       * When it receives "false", it jumps out of the loop
       */
      expect(existsMock).toHaveBeenCalledTimes(3)

      /**
       * Updates execution ttl for 2 times
       * When it received "false", it jumped out of the loop and no longer keeps updating it
       */
      expect(addExecutionMock).toHaveBeenCalledTimes(2)
    })
  })
})
