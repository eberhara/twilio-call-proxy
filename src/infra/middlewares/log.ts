import { Request, Response, NextFunction } from 'express'
import responseTime from 'response-time'
import { baseLogger } from '../logger'

const logger = baseLogger.child({
  service: 'Infra:Middlewares:Log'
})

export const log = (req: Request, res: Response, next: NextFunction) => {
  logger.http(
    `${req.method} ${req.originalUrl} - Request ID: ${req.id} - IP: ${req.ip}`
  )
  next()
}

export const logRequestTime = responseTime(
  (req: Request, res: Response, time: number) => {
    logger.http(
      `${req.method} ${req.originalUrl} - Request ID: ${req.id} - HTTP: ${
        res.statusCode
      } - Time: ${time.toFixed()}ms`
    )
  }
)

export const logError = (req: Request, res: Response, message: string) => {
  logger.http(
    `${req.method} ${req.originalUrl} - Request ID: ${req.id} - Error: ${message}`
  )
}
