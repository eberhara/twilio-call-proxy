/* eslint-disable import/first */
import { PassThrough } from 'stream'
import { loggerMock } from '../../../__tests__/mocks/logger'
jest.mock('../../../infra/logger', () => loggerMock)

import { MessageParserStream } from '../MessageParserStream'

describe('MessageParserStream', () => {
  const streamAsPromise = (data: Record<string, any>, parserStreamOpts?: any) => new Promise((resolve, reject) => {
    const destinationStream = new PassThrough()
    destinationStream.on('data', (data) => resolve(JSON.parse(data)))

    const middleStream = new MessageParserStream(parserStreamOpts)
    middleStream.on('error', reject)
    middleStream.on('finish', () => resolve(undefined))

    const sourceStream = new PassThrough()
    sourceStream.pipe(middleStream).pipe(destinationStream)
    sourceStream.push(JSON.stringify(data))
    sourceStream.end()
    sourceStream.destroy()
  })

  beforeEach(() => { jest.resetAllMocks() })

  describe('when it receives "connected" event', () => {
    it('connects but does not pass any data through', async () => {
      const message = { event: 'connected' }
      return streamAsPromise(message)
        .then((response) => { expect(response).toBeFalsy() })
    })
  })

  describe('when it receives "start" event', () => {
    const backendHosts = ['0.0.0.0']
    const message = {
      event: 'start',
      start: {
        customParameters: {
          executionId: '1',
          backendIds: JSON.stringify([1]),
          backendHosts: JSON.stringify(backendHosts)
        }
      }
    }

    it('passes start event through', async () => {
      return streamAsPromise(message)
        .then((response: any) => { expect(response).toEqual({ event: 'start' }) })
    })

    it('calls "onStart" callback function', async () => {
      const onStartMock = jest.fn()
      return streamAsPromise(message, { start: onStartMock })
        .then(() => {
          expect(onStartMock).toBeCalled()
          expect(onStartMock.mock.calls[0][0]).toEqual(backendHosts)
        })
    })
  })

  describe('when it receives "media" event', () => {
    it('passes media data through', async () => {
      const message = { event: 'media', media: { payload: 'payload' } }
      return streamAsPromise(message)
        .then((response: any) => {
          expect(response).toEqual({ event: 'media', media: 'payload' })
        })
    })
  })

  describe('when it receives "stop" event', () => {
    it('passes stop event through', async () => {
      const message = { event: 'stop' }
      return streamAsPromise(message)
        .then((response: any) => {
          expect(response).toEqual({ event: 'stop' })
        })
    })
  })

  describe('when it receives any other event', () => {
    it('throws an error', async () => {
      const message = { event: 'other-event' }
      return expect(streamAsPromise(message)).rejects.toThrow()
    })
  })
})
