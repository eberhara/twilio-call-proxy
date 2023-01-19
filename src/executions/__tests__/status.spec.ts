/* eslint-disable import/first */
import { loggerMock } from '../../__tests__/mocks/logger'
jest.mock('../../infra/logger', () => loggerMock)

const ExecutionsRepository = {
  exists: (id: string) => Promise.resolve(id === 'EXISTS')
}

jest.mock('../ExecutionsRepository', () => ({
  __esModule: true,
  ExecutionsRepository: {
    getInstance: () => ExecutionsRepository
  }
}))

import { isExecutionConnected } from '../'

describe('Executions status', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('when the execution id exists', () => {
    it('returns true', async () => {
      return isExecutionConnected('EXISTS').then((value: boolean) => {
        expect(value).toBeTruthy()
      })
    })
  })

  describe('when the execution id does not exist', () => {
    it('returns false', async () => {
      return isExecutionConnected('OK').then((value: boolean) => {
        expect(value).not.toBeTruthy()
      })
    })
  })
})
