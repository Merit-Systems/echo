import { storage } from '@/config'

export async function isAuthenticated(): Promise<boolean> {
  return storage.isAuthenticated()
}
