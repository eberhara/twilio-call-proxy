import env from '../../env'
import { baseLogger } from '../../infra/logger'
import { ICacheRepository } from './ICacheRepository'
import { LocalCache } from './implementations/LocalCache'
import { RemoteCache } from './implementations/RemoteCache'

const logger = baseLogger.child({
  service: 'Infra:Cache'
})

export const getCacheInstance = (): ICacheRepository => {
  return env.REMOTE_CACHE_ENABLED
    ? RemoteCache.getInstance()
    : LocalCache.getInstance()
}

export const cacheSetup = () => {
  if (env.REMOTE_CACHE_ENABLED) {
    logger.debug('Using remote cache. Setting up cache')
    RemoteCache.getInstance().setup()
  } else {
    logger.debug('Using local cache. Skipping cache setup')
  }
}
