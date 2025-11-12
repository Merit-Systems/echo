import { MODELS } from '@/config/models'

export { ECHODEX_ASCII_ART } from '@/config/ascii'
export { MODELS, DEFAULT_MODEL } from '@/config/models'
export { MESSAGE_MODES, THINKING_MESSAGES, THINKING_INTERVAL, THINKING_COLORS } from '@/config/messages'
export { WALLET_CHAINS, WALLET_OPTIONAL_METHODS, AUTH_OPTIONS } from '@/config/wallet'

const ECHO_URL = 'https://echo.merit.systems'
const ECHO_API_URL = 'https://api.echo.merit.systems/v1'
const ECHO_ROUTER_URL = 'https://echo.router.merit.systems'

export const AGENT_NAME = 'echodex' as const
export const AVAILABLE_MODELS = MODELS

export const ECHO_APP_ID = 'dbfe663c-b54d-4a64-bcc1-1cb24f4da32f'
export const WALLETCONNECT_PROJECT_ID = '592e3344e57cbc26ad91d191e82a4185'
export const ECHO_KEYS_URL = `${ECHO_URL}/app/${ECHO_APP_ID}/keys`

export const APP = {
  name: 'Echodex',
  description: 'CLI Coding Agent Powered by Echo',
  version: '1.0.0',
  echoAppId: ECHO_APP_ID,
  walletConnectProjectId: WALLETCONNECT_PROJECT_ID,
  echoKeysUrl: `${ECHO_URL}/app/${ECHO_APP_ID}/keys`,
  echoUrl: ECHO_URL,
  echoApiUrl: ECHO_API_URL,
  echoRouterUrl: ECHO_ROUTER_URL
} as const

export const APP_METADATA = {
  name: APP.name,
  description: APP.description,
  url: APP.echoUrl,
  icons: [`${APP.echoUrl}/favicon.ico`]
}
