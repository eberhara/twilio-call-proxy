import { CallerAuthAttemptsRepository } from '../infra/repositories'

export const getInvalidAuthAttempts = async (callerId: string) => {
  const authAttempts = await CallerAuthAttemptsRepository.getInstance().getInvalidAuthAttempts(callerId)
  return authAttempts
}
