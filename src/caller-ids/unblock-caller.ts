import { clearInvalidAuthAttempts } from './clear-invalid-auth-attempts'
import { BlockedCallersRepository } from '../infra/repositories'

export const unblockCaller = async (callerId: string) => {
  const blockedCaller = await BlockedCallersRepository.getInstance().removeBlockedCaller(callerId)
  await clearInvalidAuthAttempts(callerId)
  return blockedCaller
}
