import * as Sentry from '@sentry/node'
import * as Tracing from '@sentry/tracing'
import { Router } from 'express'
import env from '../../env'
import { baseLogger } from '../logger'

const logger = baseLogger.child({ service: 'Infra:Monitoring:Setup' })

export const setup = (app: Router) => {
  if (env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: env.SENTRY_DSN,
      environment: env.ENV,
      tracesSampleRate: env.SENTRY_TRACE_SAMPLE_RATE,
      integrations: [
        // enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),
        // enable Express.js middleware tracing
        new Tracing.Integrations.Express({ app })
      ]
    })
    logger.debug('Sending trace and performance data do Sentry')
  } else {
    logger.debug('Skipping sentry integration')
  }
}

export const getAgent = () => Sentry
