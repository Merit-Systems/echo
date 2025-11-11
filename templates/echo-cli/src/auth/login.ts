import { text, isCancel } from '@clack/prompts'
import open from 'open'
import { EchoClient } from '@merit-systems/echo-typescript-sdk'
import { storage } from '@/config'
import { ECHO_KEYS_URL } from '@/constants'
import { clearEchoClient } from './client'
import { isValid, ApiKeySchema } from '@/validation'
import { info, warning, success, error, header } from '@/print'
import { displayAppError, createError, ErrorCode } from '@/utils'

export async function loginWithEcho(): Promise<boolean> {
  try {
    header('Echo API Authentication')
    info('Opening Echo to create your API key...')
    await open(ECHO_KEYS_URL)

    const apiKey = await text({
      message: 'Enter your API key:',
      placeholder: 'echo_...',
      validate: (value) => {
        if (!value || typeof value !== 'string') {
          return 'API key is required'
        }
        if (!isValid(ApiKeySchema, value)) {
          return 'Invalid API key format (must start with echo_)'
        }
      }
    })

    if (isCancel(apiKey)) {
      warning('\nLogin cancelled')
      return false
    }

    if (typeof apiKey !== 'string') {
      warning('Login cancelled')
      return false
    }

    info('Verifying API key...')
    const testClient = new EchoClient({ apiKey })
    await testClient.users.getUserInfo()

    await storage.setApiKey(apiKey)
    await storage.setAuthMethod('echo')
    clearEchoClient()

    success('✓ Successfully logged in!')
    return true
  } catch (err) {
    displayAppError(createError({
      code: ErrorCode.AUTHENTICATION_FAILED,
      message: 'Login failed',
      originalError: err
    }))
    return false
  }
}

