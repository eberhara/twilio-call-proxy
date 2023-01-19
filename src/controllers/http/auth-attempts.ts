import { Request, Response, Router } from 'express'
import env from '../../env'
import { getInvalidAuthAttempts, invalidAuthAttempt } from '../../caller-ids'

export const authAttemptHandler = async (req: Request, res: Response) => {
  const callerId = req.params.callerId
  const response = await invalidAuthAttempt(callerId)
  res.status(201).send(response)
}

export const getAuthAttemptHandler = async (req: Request, res: Response) => {
  const callerId = req.params.callerId
  const attempts = await getInvalidAuthAttempts(callerId)

  if (!attempts) return res.sendStatus(404)
  res.status(200).send({ attempts })
}

export const authAttemptsRouter = () => {
  const router = Router()
  if (env.ENABLE_DEBUG_ROUTES) {
    router.post('/:callerId', authAttemptHandler)
    router.get('/:callerId', getAuthAttemptHandler)
  }
  return router
}
