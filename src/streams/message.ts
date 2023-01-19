import * as WebSocket from 'ws'
import { Duplex } from 'stream'
import { baseLogger } from '../infra/logger'
import { startExecution, stopExecution } from '../executions'
import { MessageParserStream } from './message-parser/MessageParserStream'
import { createBackendStream } from './create-backend-stream'

const logger = baseLogger.child({ service: 'Streams:Message' })

export const messageStream = (ws: WebSocket, onNewTargetStream: (stream: Duplex) => void) => {
  let executionId: string

  ws.on('close', () => {
    if (executionId) stopExecution(executionId)
  })

  return new MessageParserStream({
    start: (backendHosts: string[] = [], newExecutionId: string) => {
      if (!backendHosts.length) return

      let activeStreams = 0
      executionId = newExecutionId
      startExecution(executionId)

      backendHosts.forEach((host) => {
        const backendStream = createBackendStream(host)
        activeStreams++

        backendStream.on('error', (error: Error) => {
          logger.error(`Error streaming data to backend ${host}: ${error}`)
          activeStreams--
          if (activeStreams < 1) ws.close()
        })

        onNewTargetStream(backendStream)
      })
    }
  })
}
