export interface ICacheRepository {
  get<T>(key: string): Promise<T | undefined>
  getMany<T>(keys: string[]): Promise<Record<string, T>>
  set<T>(key: string, value: T, secondsOfttl?: number): Promise<boolean>
  del(key: string): Promise<boolean>
  getAllKeysWithPrefix(keyPrefix: string): Promise<string[]>
}
