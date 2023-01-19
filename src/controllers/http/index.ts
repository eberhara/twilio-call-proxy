import { Router } from 'express'
import { executionsRouter } from './executions'
import { authAttemptsRouter } from './auth-attempts'
import { blockedCallersRouter } from './blocked-callers'
import { pinRouter } from './pin'
import { defaultRouter } from './default'

export const createHttpRouters = () => {
  const router = Router()
  router.use('/auth-attempts', authAttemptsRouter())
  router.use('/blocked-callers', blockedCallersRouter())
  router.use('/executions', executionsRouter())
  router.use('/validate-pin', pinRouter())
  router.use('/', defaultRouter())
  return router
}
