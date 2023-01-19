/**
 * Websocket server to be used to expose local speaker
 * This simple websocket server mimics what would be a more complex backend in production that would receive the incoming call and handle it accordingly.
 * In our example it simply receives incoming audio streams and plays it on the available speaker
 */

import express from 'express'
import expressWs from 'express-ws'
import websocketAsStream from 'websocket-stream'
import { Transform } from 'stream'
import WaveFile from 'wavefile'
import Speaker from 'speaker'

const app = express()
const PORT = process.env.SPEAKER_PORT || 8888

expressWs(app, null, { perMessageDeflate: false })

const decoder = () => new Transform({
  transform: (chunk, _encoding, callback) => {
    const msg = JSON.parse(chunk.toString('utf8'))
    console.log('Received event', msg.event)

    if (msg.event !== 'media') {
      return callback()
    }

    const wav = new WaveFile.WaveFile()
    wav.fromScratch(1, 8000, '8m', Buffer.from(msg.media, 'base64'))
    wav.fromMuLaw()
    return callback(null, Buffer.from(wav.data.samples))
  }
})

const speaker = () => new Speaker({
  channels: 1,
  bitDepth: 16,
  sampleRate: 8000
})

app.ws('/media', (ws, req) => {
  const mediaStream = websocketAsStream(ws)
  const decode = decoder()
  const speak = speaker()

  mediaStream.on('close', () => {
    speak.close()
  })

  mediaStream
    .on('error', console.error)
    .pipe(decode)
    .on('error', console.error)
    .pipe(speak)
    .on('error', console.error)
})

console.log(`WebSocket server is listening on localhost:${PORT}`)
app.listen(PORT)
