import express from 'express'
import expressWs from 'express-ws'
import requestId from 'express-request-id'
import { applyMonitoringHandlers, applyMonitoringErrorHandler } from '../monitoring/http'
import { createRouters } from '../../controllers'
import { log, logRequestTime } from './log'
import { errorHandler } from './error'

const applyGlobalMiddlewares = (ws: expressWs.Instance) => {
  applyMonitoringHandlers(ws.app)
  ws.app.use(express.json())
  ws.app.use(requestId())
  ws.app.use(log)
  ws.app.use(logRequestTime)
}

export const applyMiddlewares = (ws: expressWs.Instance) => {
  applyGlobalMiddlewares(ws)
  ws.app.use(createRouters())
  applyMonitoringErrorHandler(ws.app)
  ws.app.use(errorHandler)
}
