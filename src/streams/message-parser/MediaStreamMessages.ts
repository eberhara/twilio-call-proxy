export type ConnectedMessage = {
  event: 'connected',
  protocol: string,
  version: string
}

export type StartMessage = {
  event: 'start',
  sequenceNumber: string, // '1', '2'...
  start: {
    accountSid: string,
    streamSid: string,
    callSid: string,
    tracks: ['inbound' | 'outbound'],
    mediaFormat: {
      encoding: string, // 'audio/x-mulaw',
      sampleRate: number, // 8000
      channels: number // 1
    },
    customParameters: {
      executionId: string, // "FNXXXXXX..."
      backendIds: string, // "['12', '13']"
      backendHosts: string // "['82.68.93.198:8900', '82.68.93.199:8900']"
    }
  },
  streamSid: string
}

export type MediaMessage = {
  event: 'media',
  sequenceNumber: string, // '1', '2'...
  media: {
    track: 'inbound' | 'outbound',
    chunk: string, // '1', '2'...,
    timestamp: string,
    payload: string // base64 content
  },
  streamSid: string
}

export type StopMessage = {
  event: 'stop',
  sequenceNumber: string, // '1', '2'...
  streamSid: string,
  stop: {
    accountSid: string,
    callSid: string
  }
}
export type MediaStreamMessage =
    ConnectedMessage | StartMessage | MediaMessage | StopMessage
