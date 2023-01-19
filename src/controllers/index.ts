import { Router } from 'express'
import { createHttpRouters } from './http'
import { createWsRouters } from './websocket'

export const createRouters = () => {
  const router = Router()
  router.use(createHttpRouters())
  router.use(createWsRouters())
  return router
}
