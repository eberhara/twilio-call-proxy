import { Transform } from 'stream'
import { baseLogger } from '../../infra/logger'
import { MediaStreamMessage } from './MediaStreamMessages'

const logger = baseLogger.child({
  service: 'Streams:MessageParserStream'
})

interface MessageParserStreamOptions {
  start: (backendHosts: string[], executionId: string) => void
}

export class MessageParserStream extends Transform {
  constructor (opts?: MessageParserStreamOptions) {
    super({
      transform: (chunk, _encoding, callback) => {
        const message: MediaStreamMessage = JSON.parse(chunk.toString('utf8'))

        switch (message.event) {
          case 'connected': {
            logger.info(`Media stream connected using ${message.protocol} protocol`)
            return callback()
          }

          case 'start': {
            const executionId = message.start.customParameters.executionId
            logger.info(`Media stream start - Execution: ${executionId} - StreamID: ${message.streamSid} - Backends ${message.start.customParameters.backendIds}`)
            const backendHosts: [string] = JSON.parse(message.start.customParameters.backendHosts)
            opts?.start(backendHosts, executionId)

            return callback(null, Buffer.from(JSON.stringify({ event: 'start' })))
          }

          case 'media': {
            const { payload } = message.media
            return callback(null, Buffer.from(JSON.stringify({ event: 'media', media: payload })))
          }

          case 'stop': {
            logger.info(`Media stream stop - ID: ${message.streamSid} after ${message.sequenceNumber} messages`)
            return callback(null, Buffer.from(JSON.stringify({ event: 'stop' })))
          }

          default: {
            logger.error(`Unable to parse message ${JSON.stringify(message)}`)
            return callback(new Error('Unable to parse message'))
          }
        }
      }
    })
  }
}
