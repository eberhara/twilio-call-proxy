import crypto from 'crypto'
import { Request, Response, NextFunction } from 'express'
import { baseLogger } from '../logger'
import env from '../../env'

const logger = baseLogger.child({
  service: 'Infra:Middlewares:ValidateRequest'
})

const AUTH_TOKEN = env.TWILIO_AUTH_TOKEN

type ValidationOptions = {
  protocol?: string
  host?: string
  url?: string
}

const getWebhookUrl = (req: Request, options: ValidationOptions) => {
  const {
    protocol = req.protocol,
    host = req.headers.host,
    url = req.originalUrl
  } = options

  return `${protocol}://${host}${url}`
}

const toFormUrlEncodedParam = (paramName: string, paramValue: any): any => {
  if (paramValue instanceof Array) {
    return paramValue.map(val => toFormUrlEncodedParam(paramName, val)).reduce((acc, val) => acc + val, '')
  }
  return paramName + paramValue
}

const getEncodedParams = (params: Record<string, any>) => {
  const parameters = !params || params == null ? {} : params
  return Object.keys(parameters).sort().reduce((acc, key) => acc + toFormUrlEncodedParam(key, parameters[key]), '')
}

const getRequestSignature = (req: Request, params: Record<string, any>, options: ValidationOptions) => {
  const webhookUrl = getWebhookUrl(req, options)
  const encodedParams = getEncodedParams(params)
  const fullUrl = `${webhookUrl}${encodedParams}`

  return crypto.createHmac('sha1', AUTH_TOKEN)
    .update(Buffer.from(fullUrl, 'utf-8'))
    .digest('base64')
}

const validateRequestSignature = (req: Request, options: ValidationOptions, params: Record<string, any> = {}) => {
  const expectedSignature = req.header('X-Twilio-Signature') as string
  const requestSignature = getRequestSignature(req, params, options)
  return expectedSignature === requestSignature
}

const isRequestValid = (req: Request, options: ValidationOptions) => (
  req.query.bodySHA256
    ? validateRequestSignature(req, options)
    : validateRequestSignature(req, options, req.body)
)

export const validateRequest = (options: ValidationOptions = {}) => (req: Request, res: Response, next: NextFunction) => {
  if (!env.VALIDATE_EXTERNAL_CALLS) {
    logger.debug('Skip validation request')
    return next()
  }

  if (!req.header('X-Twilio-Signature')) {
    logger.warn('No signature header error: X-Twilio-Signature header does not exist, maybe this request is not coming from Twilio')
    return res.type('text/plain').status(400).send('Bad Request')
  }

  if (!AUTH_TOKEN) {
    logger.error('We attempted to validate this request without first configuring our auth token')
    return res.type('text/plain').status(500).send('Internal Server Error')
  }

  if (!isRequestValid(req, options)) {
    logger.warn('Request failed to validate. Maybe this request is not coming from Twilio')
    return res.type('text/plain').status(403).send('Forbidden')
  }

  logger.debug('Request is valid. It is coming from Twilio')
  next()
}
