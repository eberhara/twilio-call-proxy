import { Router } from 'express'
import { Duplex, PassThrough } from 'stream'
import websocketAsStream from 'websocket-stream'
import * as WebSocket from 'ws'
import { baseLogger } from '../../infra/logger'
import { validateRequest } from '../../infra/middlewares'
import { messageStream } from '../../streams/message'

const logger = baseLogger.child({
  service: 'Controllers:Webocket:MediaStream'
})

export const handleStreamError = (ws: WebSocket) => (error: Error) => {
  logger.error(`Error streaming data: ${error}`)
  ws.close()
}

export const websocketHandler = (ws: WebSocket) => {
  logger.debug('WS connection opened')
  const errorHandler = handleStreamError(ws)
  let mainStream: Duplex = new PassThrough()

  const onNewTargetStream = (newTarget: Duplex) => {
    mainStream.pipe(newTarget)
  }

  const websocketStream = websocketAsStream(ws)
  const onMessageStream = messageStream(ws, onNewTargetStream)

  mainStream = websocketStream
    .on('error', errorHandler)
    .pipe(onMessageStream)
    .on('error', errorHandler)

  ws.on('close', () => {
    logger.debug('WS connection Closed')
  })
}

export const mediaRouter = () => {
  const router = Router()
  router.use(validateRequest({ protocol: 'wss', url: '/media' }))
  router.ws('/', websocketHandler)
  return router
}
