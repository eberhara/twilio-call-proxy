import { getCacheInstance } from '../infra/cache'

const EXECUTIONS_TTL_SECONDS = 5
const KEY_PREFIX = 'executions'

export class ExecutionsRepository {
  static instance: ExecutionsRepository
  private executions = getCacheInstance()

  private constructor() {} // eslint-disable-line

  public static getInstance (): ExecutionsRepository {
    if (!ExecutionsRepository.instance) {
      ExecutionsRepository.instance = new ExecutionsRepository()
    }
    return ExecutionsRepository.instance
  }

  public async addExecution (id: string) {
    this.executions.set(`${KEY_PREFIX}-${id}`, id, EXECUTIONS_TTL_SECONDS)
  }

  public async removeExecution (id: string) {
    this.executions.del(`${KEY_PREFIX}-${id}`)
  }

  public async exists (id: string) {
    const value = await this.executions.get(`${KEY_PREFIX}-${id}`)
    return !!value
  }
}
