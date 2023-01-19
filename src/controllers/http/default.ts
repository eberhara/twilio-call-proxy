import { Request, Response, Router } from 'express'
import { baseLogger } from '../../infra/logger'

const logger = baseLogger.child({
  service: 'HTTP:DefaultRouter'
})

export const indexHandler = (req: Request, res: Response) => {
  logger.debug('Healthcheck')
  const response = '200 OK'
  res.status(200).send(response)
}

export const defaultRouter = () => {
  const router = Router()
  router.get('/', indexHandler)
  return router
}
