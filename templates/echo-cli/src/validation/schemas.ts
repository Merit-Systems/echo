import { z } from 'zod'
import { MODELS } from '@/config/models'
import { MESSAGE_MODES } from '@/config/messages'

export const ApiKeySchema = z.string()
  .min(1, 'API key cannot be empty')
  .startsWith('echo_', 'API key must start with echo_')

export const StorageKeySchema = z.string().min(1)

export const UserInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.url(),
  createdAt: z.string(),
  email: z.email(),
  updatedAt: z.string(),
  picture: z.url()
})

export const BalanceSchema = z.object({
  totalPaid: z.number().nonnegative(),
  totalSpent: z.number().nonnegative(),
  balance: z.number().nonnegative(),
  currency: z.string()
})

export const ModelSchema = z.enum(MODELS.map(model => model.value) as [string, ...string[]])

export const MessageModeSchema = z.enum([MESSAGE_MODES.CHAT, MESSAGE_MODES.AGENT] as [string, string])

export const ThreadMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  mode: MessageModeSchema,
  timestamp: z.string()
})

export const ThreadSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  messages: z.array(ThreadMessageSchema),
  model: ModelSchema
})

export const ThreadsSchema = z.array(ThreadSchema)

export const AuthMethodSchema = z.enum(['echo', 'wallet', 'local-wallet'] as const)

export const WalletConnectSessionSchema = z.object({
  topic: z.string(),
  address: z.string(),
  chainId: z.number(),
  expiry: z.number().optional()
})

export const LocalWalletSessionSchema = z.object({
  address: z.string(),
  chainId: z.number(),
  createdAt: z.string()
})

export type ApiKey = z.infer<typeof ApiKeySchema>
export type UserInfo = z.infer<typeof UserInfoSchema>
export type Balance = z.infer<typeof BalanceSchema>
export type Model = z.infer<typeof ModelSchema>
export type MessageMode = z.infer<typeof MessageModeSchema>
export type ThreadMessage = z.infer<typeof ThreadMessageSchema>
export type Thread = z.infer<typeof ThreadSchema>
export type AuthMethod = z.infer<typeof AuthMethodSchema>
export type WalletConnectSession = z.infer<typeof WalletConnectSessionSchema>
export type LocalWalletSession = z.infer<typeof LocalWalletSessionSchema>
