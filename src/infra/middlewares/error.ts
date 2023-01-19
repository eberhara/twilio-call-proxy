import { Request, Response, NextFunction, ErrorRequestHandler } from 'express'
import { logError } from './log'

export const errorHandler: ErrorRequestHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) return next(error)

  const httpCode = error.httpErrorCode || 500
  const message = error.message || JSON.stringify(error)
  logError(req, res, message)
  res.status(httpCode).send({ message })
}
