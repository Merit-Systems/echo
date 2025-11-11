import QRCode from 'qrcode-terminal'
import { storage } from '@/config'
import { clearEchoClient } from './client'
import { info, warning, success, header } from '@/print'
import { 
  getChainName, 
  formatAddress,
  initializeEthereumProvider,
  clearWalletSession,
  displayAppError,
  createError,
  ErrorCode,
  type EthereumProviderInstance
} from '@/utils'
import type { WalletConnectSession } from '@/validation'

let ethereumProvider: EthereumProviderInstance | null = null

export async function loginWithWallet(): Promise<boolean> {
  try {
    header('Wallet Authentication')
    info('Connecting to your mobile wallet via WalletConnect...')

    const provider = await initializeEthereumProvider()
    ethereumProvider = provider

    return new Promise((resolve) => {
      provider.on('display_uri', (uri: string) => {
        info('\n📱 Scan QR code with your mobile wallet:\n')
        QRCode.generate(uri, { small: true }, (qr: string) => {
          console.log(qr)
        })
        info('\nWaiting for connection...')
      })

      provider.on('connect', async () => {
        try {
          const accounts = provider.accounts
          const chainId = provider.chainId
          
          if (!accounts || accounts.length === 0) {
            displayAppError(createError({
              code: ErrorCode.WALLET_DISCONNECTED,
              message: 'No accounts found in wallet'
            }))
            resolve(false)
            return
          }

          const address = accounts[0]

          const walletSession: WalletConnectSession = {
            topic: provider.session?.topic || '',
            address,
            chainId,
            expiry: provider.session?.expiry
          }

          await storage.setWalletSession(walletSession)
          await storage.setAuthMethod('wallet')
          clearEchoClient()

          provider.on('disconnect', async () => {
            await clearWalletSession()
            ethereumProvider = null
          })

          success(`\n✓ Connected to wallet: ${formatAddress(address)}`)
          success(`✓ Chain: ${getChainName(chainId)} (${chainId})`)
          success('✓ Wallet authentication configured!')
          
          resolve(true)
        } catch (err) {
          displayAppError(createError({
            code: ErrorCode.AUTHENTICATION_FAILED,
            message: 'Failed to process wallet connection',
            originalError: err
          }))
          resolve(false)
        }
      })

      provider.on('disconnect', () => {
        warning('Wallet disconnected during setup')
        resolve(false)
      })

      provider.connect().catch((err: unknown) => {
        displayAppError(createError({
          code: ErrorCode.AUTHENTICATION_FAILED,
          message: 'Failed to initiate connection',
          originalError: err
        }))
        resolve(false)
      })
    })
  } catch (err) {
    displayAppError(createError({
      code: ErrorCode.AUTHENTICATION_FAILED,
      message: 'Wallet login failed',
      originalError: err
    }))
    return false
  }
}

export async function getEthereumProvider(): Promise<EthereumProviderInstance | null> {
  if (ethereumProvider?.session) {
    return ethereumProvider
  }

  const session = await storage.getWalletSession()
  if (!session) {
    return null
  }

  try {
    const provider = await initializeEthereumProvider()

    if (!provider.session) {
      await clearWalletSession()
      ethereumProvider = null
      return null
    }

    const now = Date.now()
    if (provider.session.expiry && provider.session.expiry * 1000 < now) {
      await clearWalletSession()
      ethereumProvider = null
      return null
    }

    if (provider.session.topic !== session.topic) {
      const updatedSession: WalletConnectSession = {
        topic: provider.session.topic,
        address: provider.accounts[0],
        chainId: provider.chainId,
        expiry: provider.session.expiry
      }
      await storage.setWalletSession(updatedSession)
    }

    ethereumProvider = provider

    provider.on('disconnect', async () => {
      await clearWalletSession()
      ethereumProvider = null
    })

    return ethereumProvider
  } catch (err) {
    ethereumProvider = null
    return null
  }
}

export function clearEthereumProvider(): void {
  if (ethereumProvider?.session) {
    ethereumProvider.disconnect().catch(() => {})
  }
  ethereumProvider = null
}
