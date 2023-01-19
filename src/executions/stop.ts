import { baseLogger } from '../infra/logger'
import { ExecutionsRepository } from './ExecutionsRepository'

const logger = baseLogger.child({
  service: 'Executions:Start'
})

export const stopExecution = async (executionId: string) => {
  logger.debug(`Stopping execution ${executionId}`)
  await ExecutionsRepository.getInstance().removeExecution(executionId)
}
