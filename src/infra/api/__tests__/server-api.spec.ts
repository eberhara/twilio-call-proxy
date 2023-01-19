/* eslint-disable import/first */
import { loggerMock } from '../../../__tests__/mocks/logger'
jest.mock('../../../infra/logger', () => loggerMock)

const envMock = {
  SERVER_API_HOST: 'foo.com',
  SERVER_API_TIMEOUT_MS: 10,
  SERVER_API_KEY: 'key'
}
jest.mock('../../../env', () => ({
  __esModule: true,
  default: envMock
}))

const axiosPostMock = jest.fn()
const axiosCreateMock = jest.fn().mockImplementation(() => ({
  post: axiosPostMock
}))
const isAxiosErrorMock = jest.fn()
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: axiosCreateMock,
    isAxiosError: isAxiosErrorMock
  }
}))

import { validatePin } from '../server-api'

describe('Server API', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('Validate Pin', () => {
    const pin = '123'

    it('properly connects to server api', async () => {
      axiosPostMock.mockResolvedValue({})
      await validatePin(pin)
      expect(axiosPostMock).toHaveBeenCalledWith(
        '/server-api/audio-proxy/authenticate',
        { pin },
        { headers: { apiKey: envMock.SERVER_API_KEY } }
      )
    })

    it('properly returns server api response data when user is authenticated', async () => {
      axiosPostMock.mockResolvedValue({ data: { authenticated: true } })
      const response = await validatePin(pin)
      expect(response).toEqual({ authenticated: true })
    })

    it('properly returns server api response data when user is not authenticated', async () => {
      axiosPostMock.mockResolvedValue({ data: { authenticated: false } })
      const response = await validatePin(pin)
      expect(response).toEqual({ authenticated: false })
    })

    describe('when server api call throws an error', () => {
      describe('and it is an expected error', () => {
        describe('and the server api responded with 4XX http error', () => {
          beforeEach(() => {
            isAxiosErrorMock.mockReturnValue(true)
            axiosPostMock.mockRejectedValue({ response: { status: 403 } })
          })

          it('properly returns user unauthenticated information', async () => {
            const response = await validatePin(pin)
            expect(response).toEqual({ authenticated: false })
          })
        })

        describe('and the server api responded an error but without response data', () => {
          beforeEach(() => {
            axiosPostMock.mockRejectedValue({})
          })

          it('throws a generic error', async () => {
            const call = async () => await validatePin(pin)
            expect(call()).rejects.toThrow()
          })
        })

        describe('and the server api responded an error but without status data', () => {
          beforeEach(() => {
            axiosPostMock.mockRejectedValue({ response: {} })
          })

          it('throws a generic error', async () => {
            const call = async () => await validatePin(pin)
            expect(call()).rejects.toThrow()
          })
        })

        describe('and the server api responded with 5XX http error', () => {
          beforeEach(() => {
            axiosPostMock.mockRejectedValue({ response: { status: 503 } })
          })

          it('throws a generic error', async () => {
            const call = async () => await validatePin(pin)
            expect(call()).rejects.toThrow()
          })
        })
      })

      describe('and it is an expected error', () => {
        beforeEach(() => {
          axiosPostMock.mockRejectedValue(new Error())
          isAxiosErrorMock.mockReturnValue(false)
        })

        it('throws a generic error', async () => {
          const call = async () => await validatePin(pin)
          expect(call()).rejects.toThrow()
        })
      })
    })
  })
})
