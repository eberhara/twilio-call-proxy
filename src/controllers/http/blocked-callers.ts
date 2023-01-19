import { Request, Response, Router } from 'express'
import env from '../../env'
import { validateHeader, validateRequest } from '../../infra/middlewares'
import { getBlockedCaller, blockCaller, listBlockedCallers, unblockCaller } from '../../caller-ids'

export const unblockCallerHandler = async (req: Request, res: Response) => {
  const callerId = req.params.callerId
  const isDeleted = await unblockCaller(callerId)
  res.sendStatus(isDeleted ? 204 : 404)
}

export const blockCallerHandler = async (req: Request, res: Response) => {
  const callerId = req.params.callerId
  await blockCaller(callerId)
  res.sendStatus(201)
}

export const getBlockedCallerHandler = async (req: Request, res: Response) => {
  const callerId = req.params.callerId
  // block calls whenever caller id is not provided
  if (!callerId) return res.status(200).send({ blocked: true })

  const blockedCaller = await getBlockedCaller(callerId)
  if (!blockedCaller) return res.sendStatus(404)

  res.status(200).send({ ...blockedCaller, blocked: true })
}

export const listHandler = async (req: Request, res: Response) => {
  const list = await listBlockedCallers()
  res.status(200).send({ data: list })
}

export const blockedCallersRouter = () => {
  const router = Router()
  if (env.ENABLE_DEBUG_ROUTES) {
    router.post('/:callerId', blockCallerHandler)
  }

  const validateHeaderMiddleware = validateHeader('apiKey', env.SERVER_API_KEY)
  router.get('/:callerId', validateRequest({ protocol: 'https' }), getBlockedCallerHandler)
  router.delete('/:callerId', validateHeaderMiddleware, unblockCallerHandler)
  router.get('/', validateHeaderMiddleware, listHandler)
  return router
}
