import WebSocketClient, { createWebSocketStream } from 'ws'

export const createBackendStream = (backendHost: string) => {
  const wsclient = new WebSocketClient(`ws://${backendHost}/media`)
  return createWebSocketStream(wsclient, { encoding: 'utf8' })
}
