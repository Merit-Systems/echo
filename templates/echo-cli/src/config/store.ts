import Conf from 'conf'
import keytar from 'keytar'
import { z } from 'zod'
import { validate } from '@/validation'
import { IKeyValueStorage } from '@walletconnect/keyvaluestorage'

export enum StorageType {
  SECURE = 'secure',
  NORMAL = 'normal'
}

export interface StorageOptions {
  serviceName: string
  configName: string
}

export interface GetOptions<T> {
  type?: StorageType
  schema?: z.ZodSchema<T>
}

export interface SetOptions {
  type?: StorageType
}

export abstract class Storage {
  protected conf: Conf
  protected serviceName: string

  constructor(options: StorageOptions) {
    this.serviceName = options.serviceName
    this.conf = new Conf({
      projectName: options.configName,
      clearInvalidConfig: true
    })
  }

  async get<T>(key: string, options?: GetOptions<T>): Promise<T | undefined> {
    const type = options?.type ?? StorageType.NORMAL
    const schema = options?.schema
    
    let rawValue: unknown
    
    if (type === StorageType.SECURE) {
      const value = await keytar.getPassword(this.serviceName, key)
      rawValue = value ? JSON.parse(value) : undefined
    } else {
      rawValue = this.conf.get(key)
    }

    if (rawValue === undefined) {
      return undefined
    }

    if (schema) {
      return validate(schema, rawValue)
    }

    return rawValue as T
  }

  async set<T>(key: string, value: T, options?: SetOptions): Promise<void> {
    const type = options?.type ?? StorageType.NORMAL
    
    if (type === StorageType.SECURE) {
      await keytar.setPassword(this.serviceName, key, JSON.stringify(value))
    } else {
      this.conf.set(key, value)
    }
  }

  async delete(key: string, type: StorageType = StorageType.NORMAL): Promise<void> {
    if (type === StorageType.SECURE) {
      await keytar.deletePassword(this.serviceName, key)
    } else {
      this.conf.delete(key)
    }
  }

  async has(key: string, type: StorageType = StorageType.NORMAL): Promise<boolean> {
    if (type === StorageType.SECURE) {
      const value = await keytar.getPassword(this.serviceName, key)
      return value !== null
    }
    return this.conf.has(key)
  }

  clear(): void {
    this.conf.clear()
  }

  getAllKeys(): string[] {
    return Object.keys(this.conf.store)
  }

  getAllEntries<T>(): [string, T][] {
    return Object.entries(this.conf.store) as [string, T][]
  }
}

export class StorageAdapter extends IKeyValueStorage {
  private storage: Storage

  constructor(storage: Storage) {
    super()
    this.storage = storage
  }

  async getKeys(): Promise<string[]> {
    return this.storage.getAllKeys()
  }

  async getEntries<T = any>(): Promise<[string, T][]> {
    return this.storage.getAllEntries<T>()
  }

  async getItem<T = any>(key: string): Promise<T | undefined> {
    return this.storage.get<T>(key)
  }

  async setItem<T = any>(key: string, value: T): Promise<void> {
    await this.storage.set(key, value)
  }

  async removeItem(key: string): Promise<void> {
    await this.storage.delete(key)
  }
}
