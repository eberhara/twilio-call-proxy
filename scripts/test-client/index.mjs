/**
 * Test client to be used to test the websocket running on local server.
 * It loads the local mulaw-sample.wav sample file as an audio stream to mimic an ongoing phone call and send websocket events to the twilio-call-proxy following the same API of Twilio's ongoing calls.
 * In a production environment, Twilio would play this part:
 * Some user would call a Twilio number. Then Twilio would receive the call and pass it to the configured websocket server.
 * Twilio's Doc: https://www.twilio.com/docs/voice/twiml/stream
 */

import fs from 'fs'
import path from 'path'
import { WebSocket } from 'ws'
import { CONNECTED_MSG, START_MSG, MEDIA_MSG, STOP_MSG } from './messages.mjs'

const testServer = () => {
  const ws = new WebSocket('ws://localhost:8999/media')

  ws.on('close', () => {
    console.log('WebSocket closed')
  })

  ws.on('error', (error) => {
    console.error('WebSocket error', error)
  })

  ws.on('open', () => {
    console.log('WebSocket opened')
    const readStream = fs.createReadStream(path.join(process.cwd(), './scripts/test-client', 'mulaw-sample.wav'))

    ws.send(JSON.stringify(CONNECTED_MSG))
    console.log('Connected message sent')

    ws.send(JSON.stringify(START_MSG))
    console.log('Start message sent')

    readStream.on('data', (chunk) => {
      MEDIA_MSG.media.payload = chunk.toString('base64')
      ws.send(JSON.stringify(MEDIA_MSG))
      console.log('Media message sent')
    })

    readStream.on('close', () => {
      ws.send(JSON.stringify(STOP_MSG))
      console.log('Stop message sent')
      setTimeout(() => { ws.close() }, 3000)
    })
  })
}

testServer()
setInterval(testServer, 10000)
