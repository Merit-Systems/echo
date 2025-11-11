import { EchoClient } from '@merit-systems/echo-typescript-sdk'
import { storage } from '@/config'

let echoClientInstance: EchoClient | null = null

export async function getEchoClient(): Promise<EchoClient | null> {
  const apiKey = await storage.getApiKey()
  
  if (!apiKey) {
    return null
  }

  if (!echoClientInstance) {
    echoClientInstance = new EchoClient({ apiKey })
  }

  return echoClientInstance
}

export function clearEchoClient(): void {
  echoClientInstance = null
}
