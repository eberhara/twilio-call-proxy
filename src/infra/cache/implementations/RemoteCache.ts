import IORedis, { Redis } from 'ioredis'
import env from '../../../env'
import { ICacheRepository } from '../ICacheRepository'

export class RemoteCache implements ICacheRepository {
  static instance: RemoteCache
  private redis: Redis

  private constructor() {} // eslint-disable-line

  public static getInstance (): RemoteCache {
    if (!RemoteCache.instance) {
      RemoteCache.instance = new RemoteCache()
    }
    return RemoteCache.instance
  }

  public setup () {
    if (!env.REDIS_HOST) throw new Error('Remote cache is enabled but Redis host is not set')
    this.redis = new IORedis(env.REDIS_HOST)
  }

  async get<T> (key: string): Promise<T | undefined> {
    const value = await this.redis.get(key)
    return value as unknown as T
  }

  async getMany<T> (keys: string[]): Promise<Record<string, T>> {
    const values = await this.redis.mget(keys)
    return values as unknown as Record<string, T>
  }

  async set<T> (key: string, value: T, secondsOfttl?: number): Promise<boolean> {
    if (secondsOfttl) {
      await this.redis.set(key, value as any, 'EX', secondsOfttl)
    } else {
      await this.redis.set(key, value as any)
    }

    return true
  }

  async del (key: string): Promise<boolean> {
    await this.redis.del(key)
    return true
  }

  async getAllKeysWithPrefix (keyPrefix: string): Promise<string[]> {
    const keys = await this.redis.keys((`${keyPrefix}*`))
    return keys
  }
}
