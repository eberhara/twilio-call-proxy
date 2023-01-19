/* eslint-disable import/first */
import { loggerMock } from '../../__tests__/mocks/logger'
jest.mock('../../infra/logger', () => loggerMock)

const removeExecutionMock = jest.fn()
const ExecutionsRepository = {
  removeExecution: removeExecutionMock
}

jest.mock('../ExecutionsRepository', () => ({
  __esModule: true,
  ExecutionsRepository: {
    getInstance: () => ExecutionsRepository
  }
}))

import { stopExecution } from '../'

describe('Executions - stop', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('when the execution id exists', () => {
    it('returns true', async () => {
      await stopExecution('id')
      expect(removeExecutionMock).toBeCalledWith('id')
    })
  })
})
