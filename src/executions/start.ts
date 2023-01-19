import { baseLogger } from '../infra/logger'
import { ExecutionsRepository } from './ExecutionsRepository'

const logger = baseLogger.child({
  service: 'Executions:Start'
})

const saveExecution = (id: string) => {
  logger.debug(`Saving execution ${id} to repository`)
  return ExecutionsRepository.getInstance().addExecution(id)
}

const recurringExecutionUpdate = (id: string) => {
  const UPDATE_TIMEOUT_MS = 4000
  setTimeout(async () => {
    const executionExists = await ExecutionsRepository.getInstance().exists(id)
    if (executionExists) {
      logger.debug(`Execution ${id} still exists. Updating its ttl`)
      await saveExecution(id)
      recurringExecutionUpdate(id)
    }
  }, UPDATE_TIMEOUT_MS)
}

export const startExecution = async (id: string) => {
  logger.debug(`Starting execution ${id}`)
  await saveExecution(id)
  recurringExecutionUpdate(id)
}
