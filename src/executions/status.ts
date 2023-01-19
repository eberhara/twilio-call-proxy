import { baseLogger } from '../infra/logger'
import { ExecutionsRepository } from './ExecutionsRepository'

const logger = baseLogger.child({
  service: 'Executions:Status'
})

export const isExecutionConnected = (executionId: string) => {
  logger.debug(`Checking status for execution ${executionId}`)
  return ExecutionsRepository.getInstance().exists(executionId)
}
