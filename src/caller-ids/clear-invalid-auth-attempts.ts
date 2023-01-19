import { CallerAuthAttemptsRepository } from '../infra/repositories'

export const clearInvalidAuthAttempts = async (callerId: string) => {
  const removed = await CallerAuthAttemptsRepository.getInstance().clearInvalidAuthAttempts(callerId)
  return removed
}
