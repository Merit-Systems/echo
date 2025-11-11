#!/usr/bin/env node

import { Command } from 'commander'
import { select, isCancel } from '@clack/prompts'
import { loginWithEcho, loginWithWallet, initLocalWallet, logout } from '@/auth'
import { 
  startChatSession, 
  resumeChatSession,
  showProfile, 
  selectModel, 
  showConversationHistory, 
  exportConversationHistory,
  clearConversationHistory,
  showLocalWalletBalance,
  showLocalWalletAddress,
  exportPrivateKey,
  fundWallet
} from '@/core'
import { isAuthenticated } from '@/utils'
import { ECHODEX_ASCII_ART, AUTH_OPTIONS } from '@/constants'
import { info, warning, header } from '@/print'

const program = new Command()

program
  .name('echodex')
  .description('CLI Coding Agent Powered by Echo')
  .version('1.0.0')

program
  .command('login')
  .description('Authenticate with Echo or Wallet')
  .action(async () => {
    header('Authentication')
    
    const authMethod = await select({
      message: 'Choose authentication method:',
      options: AUTH_OPTIONS
    })

    if (isCancel(authMethod)) {
      warning('\nLogin cancelled')
      process.exit(1)
    }

    let success = false
    if (authMethod === 'echo') {
      success = await loginWithEcho()
    } else if (authMethod === 'wallet') {
      success = await loginWithWallet()
    } else if (authMethod === 'local-wallet') {
      success = await initLocalWallet()
    }

    process.exit(success ? 0 : 1)
  })

program
  .command('logout')
  .description('Log out from Echo')
  .action(async () => {
    await logout()
    process.exit(0)
  })

program
  .command('profile')
  .description('Show user profile information')
  .action(async () => {
    await showProfile()
    process.exit(0)
  })

program
  .command('model')
  .description('Select the AI model to use for chat')
  .action(async () => {
    const success = await selectModel()
    process.exit(success ? 0 : 1)
  })

program
  .command('history')
  .description('View conversation history')
  .action(async () => {
    await showConversationHistory()
    process.exit(0)
  })

program
  .command('export')
  .description('Export conversation history as JSON')
  .action(async () => {
    const success = await exportConversationHistory()
    process.exit(success ? 0 : 1)
  })

program
  .command('clear-history')
  .description('Clear all conversation history')
  .action(async () => {
    const success = await clearConversationHistory()
    process.exit(success ? 0 : 1)
  })

program
  .command('resume')
  .description('Resume a conversation from history')
  .action(async () => {
    await resumeChatSession()
    process.exit(0)
  })

program
  .command('wallet-balance')
  .description('Show local wallet USDC balance')
  .action(async () => {
    await showLocalWalletBalance()
    process.exit(0)
  })

program
  .command('wallet-address')
  .description('Show local wallet address and QR code')
  .action(async () => {
    await showLocalWalletAddress()
    process.exit(0)
  })

program
  .command('export-private-key')
  .description('Export local wallet private key (⚠️ SENSITIVE)')
  .action(async () => {
    await exportPrivateKey()
    process.exit(0)
  })

program
  .command('fund-wallet')
  .description('Show QR code and wait for USDC deposit')
  .action(async () => {
    await fundWallet()
    process.exit(0)
  })

program.action(async () => {
  const authenticated = await isAuthenticated()
  
  if (!authenticated) {
    info(ECHODEX_ASCII_ART)
    program.help()
    process.exit(0)
  } else {
    await startChatSession()
    process.exit(0)
  }
})

program.parse()
