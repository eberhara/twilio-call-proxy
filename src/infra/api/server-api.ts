/**
import axios from 'axios'
import env from '../../env'
import { baseLogger } from '../../infra/logger'

const client = axios.create({
  baseURL: env.SERVER_API_HOST,
  timeout: env.SERVER_API_TIMEOUT_MS
})

export const validatePin = async (pin: string): Promise<PinResponse> => {
  const url = '/identity-api/pin'
  const body = { pin }

  try {
    const response = await client.post<PinResponse>(url, body, {})
    return response.data
  } catch (error: any) {
    logger.error(`Unable to validate pin. ${error.message}`)

    if (axios.isAxiosError(error)) {
      if (error.response?.status && error.response.status < 500) {
        return { authenticated: false }
      }
    }
    throw new Error('Unable to validate pin')
  }
*/

type PinResponse = {
  authenticated: boolean
  backendIds?: number[],
  backendHosts?: string[]
}

export const validatePin = async (pin: string): Promise<PinResponse> => {
  return {
    authenticated: true,
    backendIds: [123123],
    backendHosts: ['localhost:8888']
  }
}
