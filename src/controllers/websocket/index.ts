import { Router } from 'express'
import { mediaRouter } from './media-stream'

export const createWsRouters = () => {
  const router = Router()
  router.use('/media', mediaRouter())
  return router
}
