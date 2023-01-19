import { baseLogger } from '../infra/logger'
import { BlockedCallersRepository } from '../infra/repositories'
import { BlockedCaller } from './types'

const logger = baseLogger.child({
  service: 'CallerIds:BlockCaller'
})

export const blockCaller = async (callerId: string) => {
  const blockedCaller: BlockedCaller = {
    id: callerId,
    blockedOn: new Date().toISOString()
  }
  await BlockedCallersRepository.getInstance().saveBlockedCaller(blockedCaller)
  logger.debug(`Caller ${callerId} blocked`)
}
