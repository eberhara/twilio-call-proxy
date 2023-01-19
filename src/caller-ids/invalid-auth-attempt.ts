import env from '../env'
import { baseLogger } from '../infra/logger'
import { CallerAuthAttemptsRepository } from '../infra/repositories'
import { CallerInvalidAuthAttempts } from './types'
import { blockCaller } from './block-caller'

const logger = baseLogger.child({
  service: 'CallerIds:InvalidAuthAttempt'
})

const increamentInvalidAuthAttempts = async (callerId: string) => {
  const invalidAttemptsFromDb = await CallerAuthAttemptsRepository.getInstance().getInvalidAuthAttempts(callerId)
  const invalidAttempts = invalidAttemptsFromDb ? invalidAttemptsFromDb + 1 : 1
  await CallerAuthAttemptsRepository.getInstance().upsert(callerId, invalidAttempts)
  return invalidAttempts
}

const handleCallerIdBlock = async (callerId: string, invalidAuthAttempts: number) => {
  if (invalidAuthAttempts > env.INVALID_AUTH_ATTEMPTS_ALLOWED) {
    logger.debug(`Caller ${callerId} attempts (${invalidAuthAttempts}) are greater than allowed (${env.INVALID_AUTH_ATTEMPTS_ALLOWED})`)
    await blockCaller(callerId)
    return true
  }

  return false
}

export const invalidAuthAttempt = async (callerId: string) => {
  const invalidAttempts = await increamentInvalidAuthAttempts(callerId)
  logger.debug(`Caller ${callerId} has now ${invalidAttempts} invalid auth attempts`)

  const isCallerBlocked = await handleCallerIdBlock(callerId, invalidAttempts)

  const response: CallerInvalidAuthAttempts = {
    id: callerId,
    attempts: invalidAttempts,
    blocked: isCallerBlocked
  }

  return response
}
