import express from 'express'
import expressWs from 'express-ws'
import { setup as monitoringSetup } from './monitoring/setup'
import env from '../env'
import { baseLogger } from './logger'
import { applyMiddlewares } from './middlewares'

const logger = baseLogger.child({
  service: 'Infra:Server'
})

export const serverSetup = () => new Promise<void>(resolve => {
  const app = express()
  const wsExpress = expressWs(app)
  monitoringSetup(wsExpress.app)
  applyMiddlewares(wsExpress)

  wsExpress.app.listen(env.AUDIO_PROXY_PORT, () => {
    logger.info(`Audio proxy listening on port ${env.AUDIO_PROXY_PORT}`)
    resolve()
  })
})
