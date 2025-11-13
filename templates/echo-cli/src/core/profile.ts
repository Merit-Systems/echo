import chalk from 'chalk'
import { getEchoClient } from '@/auth'
import { storage } from '@/config'
import { validate, UserInfoSchema, BalanceSchema } from '@/validation'
import { warning, header, label, blankLine, error } from '@/print'
import { getChainName, formatAddress, getUSDCBalance, displayAppError, createError, ErrorCode } from '@/utils'

export async function showProfile(): Promise<void> {
  const authMethod = await storage.getAuthMethod()
  
  if (!authMethod) {
    warning('Not authenticated. Please run: echodex login')
    return
  }

  if (authMethod === 'echo') {
    await showEchoProfile()
  } else if (authMethod === 'wallet') {
    await showWalletProfile()
  } else if (authMethod === 'local-wallet') {
    await showLocalWalletProfile()
  }
}

async function showEchoProfile(): Promise<void> {
  const client = await getEchoClient()
  
  if (!client) {
    warning('Echo authentication not found. Please run: echodex login')
    return
  }

  try {
    const [rawUser, rawBalance] = await Promise.all([
      client.users.getUserInfo(),
      client.balance.getBalance()
    ])

    const user = validate(UserInfoSchema, rawUser)
    const balance = validate(BalanceSchema, rawBalance)

    blankLine()
    header('=== Echo Profile ===')
    blankLine()
    label('Auth Method:', chalk.cyan('Echo API Key'))
    label('Email:', chalk.white(user.email))
    label('Balance:', chalk.green(`$${balance.balance.toFixed(4)}`))
    label('Total Spent:', chalk.yellow(`$${balance.totalSpent.toFixed(4)}`))
    label('Created:', chalk.white(new Date(user.createdAt as string).toLocaleDateString()))
    blankLine()
  } catch (err) {
    displayAppError(createError({
      code: ErrorCode.API_ERROR,
      message: 'Failed to fetch profile',
      originalError: err
    }))
  }
}

async function showWalletProfile(): Promise<void> {
  const session = await storage.getWalletSession()
  
  if (!session) {
    warning('Wallet session not found. Please run: echodex login')
    return
  }

  blankLine()
  header('=== Wallet Profile ===')
  blankLine()
  label('Auth Method:', chalk.cyan('WalletConnect'))
  label('Address:', chalk.white(session.address))
  label('Short Address:', chalk.gray(formatAddress(session.address)))
  label('Chain:', chalk.green(`${getChainName(session.chainId, true)} (${session.chainId})`))
  label('Session Topic:', chalk.dim(session.topic.slice(0, 32) + '...'))
  if (session.expiry) {
    const expiryDate = new Date(session.expiry * 1000)
    label('Session Expires:', chalk.white(expiryDate.toLocaleString()))
  }
  blankLine()
}

async function showLocalWalletProfile(): Promise<void> {
  const session = await storage.getLocalWalletSession()
  
  if (!session) {
    warning('Local wallet session not found. Please run: echodex login')
    return
  }

  try {
    const balance = await getUSDCBalance(session.address as `0x${string}`, session.chainId)

    blankLine()
    header('=== Local Wallet Profile ===')
    blankLine()
    label('Auth Method:', chalk.cyan('Local Wallet (Self Custody)'))
    label('Address:', chalk.white(session.address))
    label('Short Address:', chalk.gray(formatAddress(session.address)))
    label('Chain:', chalk.green(`${getChainName(session.chainId, true)} (${session.chainId})`))
    label('USDC Balance:', chalk.green(`${balance} USDC`))
    label('Created:', chalk.white(new Date(session.createdAt).toLocaleDateString()))
    blankLine()
    label('Security:', chalk.yellow('🔐 Private key stored in OS keychain'))
    blankLine()
  } catch (err) {
    displayAppError(createError({
      code: ErrorCode.WALLET_DISCONNECTED,
      message: 'Failed to fetch wallet profile',
      originalError: err
    }))
  }
}
