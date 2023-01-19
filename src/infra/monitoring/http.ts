import { Router } from 'express'
import { getAgent } from './setup'
import env from '../../env'

export const applyMonitoringHandlers = (app: Router) => {
  app.use(getAgent().Handlers.requestHandler({
    ip: true
  }))
  app.use(getAgent().Handlers.tracingHandler())

  if (env.ENABLE_DEBUG_ROUTES) {
    app.get('/debug-sentry', () => { throw new Error('My test Sentry error!') })
  }
}

export const applyMonitoringErrorHandler = (app: Router) => {
  app.use(getAgent().Handlers.errorHandler())
}
