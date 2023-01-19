import { BlockedCallersRepository } from '../infra/repositories'
import { BlockedCaller } from './types'

export const listBlockedCallers = async (): Promise<BlockedCaller[]> => (
  BlockedCallersRepository.getInstance().listBlockedCallers()
)
