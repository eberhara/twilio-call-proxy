import { baseLogger } from '../infra/logger'
import { invalidAuthAttempt, clearInvalidAuthAttempts } from '../caller-ids'
import { AuthPinsRepository } from '../infra/repositories'
import { AuthPinResponse } from './types'

const logger = baseLogger.child({
  service: 'AuthPins:PinValidation'
})

const handleAuthenticatedPin = async (callerId: string) => {
  logger.debug(`Caller ${callerId} successfully validated pin. Therefore clearing any invalid auth attempt`)
  await clearInvalidAuthAttempts(callerId)
}

export const pinValidation = async (pin: string, callerId: string): Promise<AuthPinResponse> => {
  logger.debug(`Pin validation started for caller ${callerId}`)
  const validation = await AuthPinsRepository.getInstance().validatePin(pin)

  if (!validation.authenticated) {
    logger.debug(`Pin validation failed for caller ${callerId}`)
    const invalidAttemptResponse = await invalidAuthAttempt(callerId)
    return {
      ...validation,
      attempts: invalidAttemptResponse,
      blocked: invalidAttemptResponse.blocked
    }
  }

  await handleAuthenticatedPin(callerId)
  return validation
}
