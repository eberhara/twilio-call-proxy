import NodeCache from 'node-cache'
import { ICacheRepository } from '../ICacheRepository'

const IN_MEM_DEFAULT_TTL_SECONDS = 31536000 // 1 year

export class LocalCache implements ICacheRepository {
  static instance: LocalCache
  private cache = new NodeCache()

  private constructor() {} // eslint-disable-line

  public static getInstance (): LocalCache {
    if (!LocalCache.instance) {
      LocalCache.instance = new LocalCache()
    }
    return LocalCache.instance
  }

  async get<T> (key: string): Promise<T | undefined> {
    return this.cache.get(key)
  }

  async getMany<T> (keys: string[]): Promise<Record<string, T>> {
    const values = this.cache.mget(keys)
    return values as unknown as Record<string, T>
  }

  async set<T> (key: string, value: T, secondsOfttl?: number): Promise<boolean> {
    return this.cache.set(key, value, secondsOfttl || IN_MEM_DEFAULT_TTL_SECONDS)
  }

  async del (key: string): Promise<boolean> {
    return this.cache.del(key) > 0
  }

  async getAllKeysWithPrefix (keyPrefix: string): Promise<string[]> {
    const allKeys = this.cache.keys()
    const keys = allKeys.filter((key) => key.startsWith(keyPrefix))
    return keys
  }
}
