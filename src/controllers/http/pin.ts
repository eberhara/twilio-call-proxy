import { Request, Response, Router } from 'express'
import { validateRequest } from '../../infra/middlewares'
import { pinValidation } from '../../auth-pins'

export const validatePinHandler = async (req: Request, res: Response) => {
  const pin = req.body.pin
  const callerId = req.body.callerId

  const response = await pinValidation(pin, callerId)
  res.status(200).send(response)
}

export const pinRouter = () => {
  const router = Router()
  router.use(validateRequest({ protocol: 'https' }))
  router.post('/', validatePinHandler)
  return router
}
