import { BlockedCaller } from '../../caller-ids/types'
import { getCacheInstance } from '../cache'

const KEY_PREFIX = 'blocked-callers'

export class BlockedCallersRepository {
  static instance: BlockedCallersRepository
  private cache = getCacheInstance()

  private constructor() {} // eslint-disable-line

  public static getInstance (): BlockedCallersRepository {
    if (!BlockedCallersRepository.instance) {
      BlockedCallersRepository.instance = new BlockedCallersRepository()
    }
    return BlockedCallersRepository.instance
  }

  public async findBlockedCaller (id: string) {
    const value = await this.cache.get(`${KEY_PREFIX}-${id}`)
    return value ? JSON.parse(value as string) as BlockedCaller : undefined
  }

  public async saveBlockedCaller (caller: BlockedCaller) {
    const data = JSON.stringify(caller)
    const saved = await this.cache.set(`${KEY_PREFIX}-${caller.id}`, data)
    return saved
  }

  public async removeBlockedCaller (id: string) {
    const deleted = await this.cache.del(`${KEY_PREFIX}-${id}`)
    return deleted
  }

  public async listBlockedCallers () {
    const keys = await this.cache.getAllKeysWithPrefix(KEY_PREFIX)
    if (!keys || !keys.length) return []

    const rawBlockedCallers = await this.cache.getMany(keys)
    const blockedCallers = Object.values(rawBlockedCallers)
      .filter((rawCaller) => !!rawCaller)
      .map((rawCaller) => (JSON.parse(rawCaller as string) as BlockedCaller))

    return blockedCallers
  }
}
