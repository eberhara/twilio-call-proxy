export const CONNECTED_MSG = { event: 'connected', protocol: 'Call', version: '1.0.0' }

export const START_MSG = {
  event: 'start',
  sequenceNumber: '1',
  start: {
    accountSid: 'accountSid',
    streamSid: 'streamSid',
    callSid: 'callSid',
    tracks: 'inbound',
    mediaFormat: {
      encoding: 'audio/x-mulaw',
      sampleRate: 8000,
      channels: 1
    },
    customParameters: {
      executionId: 'FN1234',
      backendIds: JSON.stringify(['123123']),
      backendHosts: JSON.stringify(['localhost:8888'])
    }
  },
  streamSid: 'streamSid'
}

export const MEDIA_MSG = {
  event: 'media',
  sequenceNumber: '1',
  media: {
    track: 'inbound',
    chunk: '1',
    timestamp: 'test',
    payload: 'base64 content'
  },
  streamSid: 'streamSid'
}

export const STOP_MSG = {
  event: 'stop',
  sequenceNumber: '1',
  streamSid: 'streamSid',
  stop: {
    accountSid: 'accountSid',
    callSid: 'callSid'
  }
}
