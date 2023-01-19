import env from '../../env'
import { getCacheInstance } from '../cache'

const KEY_PREFIX = 'auth-attempts'

export class CallerAuthAttemptsRepository {
  static instance: CallerAuthAttemptsRepository
  private cache = getCacheInstance()

  private constructor() {} // eslint-disable-line

  public static getInstance (): CallerAuthAttemptsRepository {
    if (!CallerAuthAttemptsRepository.instance) {
      CallerAuthAttemptsRepository.instance = new CallerAuthAttemptsRepository()
    }
    return CallerAuthAttemptsRepository.instance
  }

  public async getInvalidAuthAttempts (callerId: string) {
    const value = await this.cache.get(`${KEY_PREFIX}-${callerId}`)
    return value ? parseInt(value as string) : undefined
  }

  public async clearInvalidAuthAttempts (callerId: string) {
    const deleted = await this.cache.del(`${KEY_PREFIX}-${callerId}`)
    return deleted
  }

  public async upsert (callerId: string, invalidAuthAttempts: number) {
    const saved = await this.cache.set(`${KEY_PREFIX}-${callerId}`, invalidAuthAttempts, env.INVALID_AUTH_ATTEMPTS_CACHE_TTL_SECONDS)
    return saved
  }
}
