import { CallerInvalidAuthAttempts } from '../../caller-ids/types'

type AuthenticatedPinResponse = {
  authenticated: true
  backendIds: string // JSON.stringify([12]),
  backendHosts: string // JSON.stringify(['82.68.185.190:8900'])
}

type UnauthenticatedPinResponse = {
  authenticated: false
  blocked?: boolean
  attempts?: CallerInvalidAuthAttempts
}

export type AuthPinResponse = AuthenticatedPinResponse | UnauthenticatedPinResponse
