/* eslint-disable import/first */
const listBlockedCallersMock = jest.fn()
const BlockedCallersRepository = {
  listBlockedCallers: listBlockedCallersMock
}
jest.mock('../../infra/repositories', () => ({
  __esModule: true,
  BlockedCallersRepository: {
    getInstance: () => BlockedCallersRepository
  }
}))

import { listBlockedCallers } from '../'

describe('Caller IDs - List blocked callers', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    listBlockedCallersMock.mockResolvedValue([{ id: '123' }])
  })

  it('returns list of blocked callers', async () => {
    const response = await listBlockedCallers()
    expect(response).toEqual([{ id: '123' }])
  })
})
