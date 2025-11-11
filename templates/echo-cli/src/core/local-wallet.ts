import { confirm, isCancel } from '@clack/prompts'
import chalk from 'chalk'
import Table from 'cli-table3'
import { storage } from '@/config'
import { info, warning, success, error, header, blankLine } from '@/print'
import {
  getUSDCBalance,
  generateQRCodeForAddress,
  formatAddress,
  getChainName,
  displayAppError,
  createError,
  ErrorCode
} from '@/utils'

async function checkLocalWalletAuth(): Promise<boolean> {
  const authMethod = await storage.getAuthMethod()
  
  if (authMethod !== 'local-wallet') {
    warning('This command requires local wallet authentication')
    info('Please run: echodex login')
    info('Then select: Local Wallet (Self Custody)')
    return false
  }

  const session = await storage.getLocalWalletSession()
  if (!session) {
    warning('Local wallet session not found. Please run: echodex login')
    return false
  }

  return true
}

export async function showLocalWalletBalance(): Promise<void> {
  try {
    if (!await checkLocalWalletAuth()) {
      return
    }

    const session = await storage.getLocalWalletSession()
    if (!session) return

    header('Local Wallet Balance')

    info('Fetching balance...')
    const balance = await getUSDCBalance(session.address as `0x${string}`, session.chainId)

    const table = new Table({
      head: ['Property', 'Value'],
      colWidths: [20, 60],
      style: {
        head: ['cyan']
      }
    })

    table.push(
      ['Chain', `${getChainName(session.chainId)} (${session.chainId})`],
      ['Address', formatAddress(session.address)],
      ['USDC Balance', `${balance} USDC`]
    )

    blankLine()
    console.log(table.toString())
    blankLine()
  } catch (err) {
    displayAppError(createError({
      code: ErrorCode.WALLET_DISCONNECTED,
      message: 'Failed to fetch balance',
      originalError: err
    }))
  }
}

export async function showLocalWalletAddress(): Promise<void> {
  try {
    if (!await checkLocalWalletAuth()) {
      return
    }

    const session = await storage.getLocalWalletSession()
    if (!session) return

    blankLine()
    header('=== Local Wallet Address ===')
    blankLine()
    info(`Full Address:  ${chalk.white(session.address)}`)
    info(`Short Address: ${chalk.gray(formatAddress(session.address))}`)
    info(`Network:       ${chalk.green(getChainName(session.chainId))} (${session.chainId})`)
    blankLine()
    info('📱 Scan QR code to send USDC:\n')
    generateQRCodeForAddress(session.address)
    blankLine()
    info('💡 Tip: Send USDC on the correct network to fund your wallet')
    blankLine()
  } catch (err) {
    displayAppError(createError({
      code: ErrorCode.WALLET_DISCONNECTED,
      message: 'Failed to display address',
      originalError: err
    }))
  }
}

export async function exportPrivateKey(): Promise<void> {
  try {
    if (!await checkLocalWalletAuth()) {
      return
    }

    blankLine()
    header('⚠️  EXPORT PRIVATE KEY ⚠️')
    blankLine()
    warning('WARNING: Your private key provides FULL ACCESS to your wallet!')
    warning('Never share it with anyone or paste it into untrusted applications.')
    warning('Anyone with your private key can steal all your funds.')
    blankLine()

    const confirmed = await confirm({
      message: 'Do you understand the risks and want to proceed?'
    })

    if (isCancel(confirmed) || !confirmed) {
      info('\nExport cancelled')
      return
    }

    const privateKey = await storage.getLocalWalletPrivateKey()
    if (!privateKey) {
      error('Private key not found')
      return
    }

    blankLine()
    error('═══════════════════════════════════════════════════════════')
    error('                    YOUR PRIVATE KEY')
    error('═══════════════════════════════════════════════════════════')
    blankLine()
    console.log(chalk.red.bold(privateKey))
    blankLine()
    error('═══════════════════════════════════════════════════════════')
    blankLine()
    warning('⚠️  Keep this key safe and secure!')
    warning('⚠️  Delete this from your terminal history!')
    warning('⚠️  Anyone with this key can access your funds!')
    blankLine()
  } catch (err) {
    displayAppError(createError({
      code: ErrorCode.AUTHENTICATION_FAILED,
      message: 'Failed to export private key',
      originalError: err
    }))
  }
}

export async function fundWallet(): Promise<void> {
  try {
    if (!await checkLocalWalletAuth()) {
      return
    }

    const session = await storage.getLocalWalletSession()
    if (!session) return

    blankLine()
    header('=== Fund Local Wallet ===')
    blankLine()
    info(`Wallet Address: ${session.address}`)
    info(`Network: ${getChainName(session.chainId)} (${session.chainId})`)
    blankLine()

    const currentBalance = await getUSDCBalance(session.address as `0x${string}`, session.chainId)
    info(`Current USDC Balance: ${currentBalance} USDC`)
    blankLine()

    info('📱 Scan QR code to send USDC:\n')
    generateQRCodeForAddress(session.address)
    blankLine()

    // Start balance polling
    info('💰 Waiting for USDC deposit...')
    info('   (Press Ctrl+C to stop monitoring)\n')

    const startBalance = parseFloat(currentBalance)
    let cancelled = false

    const handleCancel = () => {
      cancelled = true
      info('\n\n✓ Stopped monitoring for deposits')
      process.exit(0)
    }

    process.on('SIGINT', handleCancel)

    try {
      while (!cancelled) {
        const balance = await getUSDCBalance(session.address as `0x${string}`, session.chainId)
        const balanceNum = parseFloat(balance)

        if (balanceNum > startBalance) {
          const diff = (balanceNum - startBalance).toFixed(2)
          success(`\n✓ Received ${diff} USDC!`)
          success(`✓ New balance: ${balance} USDC`)
          break
        }

        // Wait 3 seconds before next check
        await new Promise(resolve => setTimeout(resolve, 3000))
      }
    } finally {
      process.off('SIGINT', handleCancel)
    }

    blankLine()
  } catch (err) {
    displayAppError(createError({
      code: ErrorCode.WALLET_DISCONNECTED,
      message: 'Failed to fund wallet',
      originalError: err
    }))
  }
}

