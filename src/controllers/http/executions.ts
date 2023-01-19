import { Request, Response, Router } from 'express'
import { isExecutionConnected } from '../../executions'

export const executionStatusHandler = async (req: Request, res: Response) => {
  const executionId = req.params.executionId
  const isConnected = await isExecutionConnected(executionId)
  res.sendStatus(isConnected ? 200 : 410)
}

export const executionsRouter = () => {
  const router = Router()
  router.get('/:executionId/connected', executionStatusHandler)
  return router
}
