import { AuthPinResponse } from '../../auth-pins/types'
import { validatePin } from '../api/server-api'

export class AuthPinsRepository {
  static instance: AuthPinsRepository

  private constructor() {} // eslint-disable-line

  public static getInstance (): AuthPinsRepository {
    if (!AuthPinsRepository.instance) {
      AuthPinsRepository.instance = new AuthPinsRepository()
    }
    return AuthPinsRepository.instance
  }

  public async validatePin (pin: string): Promise<AuthPinResponse> {
    const pinResponse = await validatePin(pin)
    if (!pinResponse.authenticated) return { authenticated: false }

    return {
      authenticated: true,
      backendIds: JSON.stringify(pinResponse.backendIds),
      backendHosts: JSON.stringify(pinResponse.backendHosts)
    }
  }
}
