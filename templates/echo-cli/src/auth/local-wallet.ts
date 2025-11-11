import { select, isCancel } from '@clack/prompts'
import { storage } from '@/config'
import { CHAIN_OPTIONS } from '@/config/wallet'
import { clearEchoClient } from './client'
import { info, warning, success, header } from '@/print'
import {
  generateWallet,
  generateQRCodeForAddress,
  getUSDCBalance,
  formatAddress,
  getChainName,
  displayAppError,
  createError,
  ErrorCode
} from '@/utils'

export async function initLocalWallet(): Promise<boolean> {
  try {
    header('Local Wallet Setup')
    info('Creating a new self-custodied wallet...')

    // Prompt user to select chain
    const chainId = await select({
      message: 'Select blockchain network:',
      options: CHAIN_OPTIONS
    })

    if (isCancel(chainId)) {
      warning('\nWallet setup cancelled')
      return false
    }

    if (typeof chainId !== 'number') {
      warning('Wallet setup cancelled')
      return false
    }

    // Generate new wallet
    const wallet = generateWallet()

    // Store private key securely
    await storage.setLocalWalletPrivateKey(wallet.privateKey)

    // Store session data
    await storage.setLocalWalletSession({
      address: wallet.address,
      chainId,
      createdAt: new Date().toISOString()
    })

    // Set auth method
    await storage.setAuthMethod('local-wallet')
    clearEchoClient()

    // Display wallet information
    success('\n✓ Local wallet created successfully!')
    info(`\nWallet Address: ${wallet.address}`)
    info(`Short Address: ${formatAddress(wallet.address)}`)
    info(`Network: ${getChainName(chainId)} (${chainId})`)
    
    warning('\n⚠️  IMPORTANT: You are responsible for your private key!')
    warning('⚠️  Your key is stored securely in your OS keychain.')
    warning('⚠️  Use "echodex export-private-key" to backup your key.')

    // Display QR code for funding
    info('\n📱 Scan this QR code to send USDC to your wallet:\n')
    generateQRCodeForAddress(wallet.address)
    
    // Start balance polling
    info('\n💰 Waiting for USDC deposit...')
    info('   (You can press Ctrl+C to cancel and continue later)\n')

    let cancelled = false
    const handleCancel = () => {
      cancelled = true
      info('\n\n✓ Wallet setup complete!')
      info('  Fund your wallet later using: echodex fund-wallet')
      process.exit(0)
    }

    process.on('SIGINT', handleCancel)

    try {
      // Poll for balance
      while (!cancelled) {
        const balance = await getUSDCBalance(wallet.address, chainId)
        const balanceNum = parseFloat(balance)

        if (balanceNum > 0) {
          success(`\n✓ Received ${balance} USDC!`)
          success('✓ Your wallet is ready to use!')
          break
        }

        // Wait 3 seconds before next check
        await new Promise(resolve => setTimeout(resolve, 3000))
      }
    } finally {
      process.off('SIGINT', handleCancel)
    }

    return true
  } catch (err) {
    displayAppError(createError({
      code: ErrorCode.AUTHENTICATION_FAILED,
      message: 'Local wallet setup failed',
      originalError: err
    }))
    return false
  }
}

