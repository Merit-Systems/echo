import { createEchoOpenAI } from '@merit-systems/echo-typescript-sdk'
import { createX402OpenAI } from '@merit-systems/ai-x402'
import type { LanguageModel } from 'ai'
import { storage } from '@/config'
import { ECHO_APP_ID, APP } from '@/constants'
import { createWalletSigner, createLocalWalletSigner, throwError, ErrorCode } from '@/utils'

interface AIProvider {
  (modelId: string): LanguageModel
}

export async function getAIProvider(): Promise<AIProvider | null> {
  const authMethod = await storage.getAuthMethod()

  if (authMethod === 'echo') {
    return createEchoProvider()
  } else if (authMethod === 'wallet') {
    return createWalletProvider()
  } else if (authMethod === 'local-wallet') {
    return createLocalWalletProvider()
  }

  return null
}

async function createEchoProvider(): Promise<AIProvider> {
  const apiKey = await storage.getApiKey()

  if (!apiKey) {
    throwError({
      code: ErrorCode.AUTHENTICATION_FAILED,
      message: 'Echo API key not found'
    })
  }

  const openai = createEchoOpenAI(
    { appId: ECHO_APP_ID },
    async () => apiKey
  )

  return openai
}

async function createWalletProvider(): Promise<AIProvider> {
  const signer = await createWalletSigner()

  if (!signer) {
    throwError({
      code: ErrorCode.WALLET_SESSION_EXPIRED,
      message: 'Wallet session expired or disconnected'
    })
  }

  return createX402OpenAI({
    walletClient: signer,
    baseRouterUrl: APP.echoRouterUrl,
    echoAppId: ECHO_APP_ID
  })
}

async function createLocalWalletProvider(): Promise<AIProvider> {
  const signer = await createLocalWalletSigner()

  if (!signer) {
    throwError({
      code: ErrorCode.WALLET_SESSION_EXPIRED,
      message: 'Local wallet session expired or not found'
    })
  }

  return createX402OpenAI({
    walletClient: signer,
    baseRouterUrl: APP.echoRouterUrl,
    echoAppId: ECHO_APP_ID
  })
}
