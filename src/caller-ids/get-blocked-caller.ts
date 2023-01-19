import { baseLogger } from '../infra/logger'
import { BlockedCallersRepository } from '../infra/repositories'
import { BlockedCaller } from './types'
import { getWithheldCallers } from './get-withheld-callers'

const logger = baseLogger.child({
  service: 'CallerIds:GetBlockedCaller'
})

const checkWithheldCaller = (callerId: string): BlockedCaller | undefined => {
  const withheldCallers = getWithheldCallers()
  return withheldCallers.indexOf(callerId) > -1
    ? { id: callerId, withheld: true }
    : undefined
}

export const getBlockedCaller = async (callerId: string) => {
  const withheldCallerResponse = checkWithheldCaller(callerId)
  if (withheldCallerResponse) {
    logger.debug(`Caller ${callerId} is a private or withheld number`)
    return withheldCallerResponse
  }

  const blockedCaller = await BlockedCallersRepository.getInstance().findBlockedCaller(callerId)
  return blockedCaller
}
