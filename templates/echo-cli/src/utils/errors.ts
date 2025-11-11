import { error, warning, hint, blankLine } from '@/print'

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  WALLET_SESSION_EXPIRED = 'WALLET_SESSION_EXPIRED',
  WALLET_DISCONNECTED = 'WALLET_DISCONNECTED',
  WRONG_CHAIN = 'WRONG_CHAIN',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  API_ERROR = 'API_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CANCELLED = 'CANCELLED',
  UNKNOWN = 'UNKNOWN'
}

export interface ErrorContext {
  code: ErrorCode
  message: string
  details?: string
  originalError?: unknown
  responseBody?: string
  requiredChainId?: number
  currentChainId?: number
}

export class AppError extends Error {
  code: ErrorCode
  details?: string
  originalError?: unknown
  responseBody?: string
  requiredChainId?: number
  currentChainId?: number

  constructor(context: ErrorContext) {
    super(context.message)
    this.name = 'AppError'
    this.code = context.code
    this.details = context.details
    this.originalError = context.originalError
    this.responseBody = context.responseBody
    this.requiredChainId = context.requiredChainId
    this.currentChainId = context.currentChainId
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export function createError(context: ErrorContext): AppError {
  return new AppError(context)
}

export function throwError(context: ErrorContext): never {
  throw createError(context)
}

export function handleError(err: unknown, fallbackMessage: string = 'An error occurred'): void {
  if (err instanceof AppError) {
    displayAppError(err)
  } else if (err instanceof Error) {
    error(err.message)
  } else {
    error(fallbackMessage)
  }
}

export function displayAppError(err: unknown): void {
  // Convert to AppError if needed
  let appError: AppError
  
  if (isAppError(err)) {
    appError = err
  } else if (is402PaymentError(err)) {
    appError = transformPaymentError(err)
  } else if (err instanceof Error) {
    appError = createError({
      code: ErrorCode.UNKNOWN,
      message: err.message,
      originalError: err
    })
  } else {
    appError = createError({
      code: ErrorCode.UNKNOWN,
      message: 'An unexpected error occurred',
      originalError: err
    })
  }

  blankLine()

  switch (appError.code) {
    case ErrorCode.VALIDATION_ERROR:
      error('Validation Error')
      if (appError.details) {
        hint(appError.details)
      }
      break

    case ErrorCode.AUTHENTICATION_FAILED:
      error('Authentication Failed')
      hint(appError.message)
      hint('Please check your credentials and try again')
      break

    case ErrorCode.WALLET_SESSION_EXPIRED:
      error('Wallet Session Expired')
      warning('Your WalletConnect session has expired or was disconnected')
      hint('Please reconnect your wallet: echodex login')
      break

    case ErrorCode.WALLET_DISCONNECTED:
      warning('Wallet Disconnected')
      hint('Please reconnect your wallet: echodex login')
      break

    case ErrorCode.WRONG_CHAIN:
      error('Wrong Blockchain Network')
      hint(`Your wallet is on chain ${appError.currentChainId}`)
      hint(`Please switch to chain ${appError.requiredChainId} in your mobile wallet`)
      break

    case ErrorCode.INSUFFICIENT_FUNDS:
      error('💰 Insufficient USDC Balance')
      warning('Your wallet does not have enough USDC to complete this request')
      blankLine()
      hint('To fund your wallet:')
      hint('  • Run: echodex fund-wallet')
      hint('  • Or check balance: echodex wallet-balance')
      hint('  • Or view address: echodex wallet-address')
      if (appError.details) {
        blankLine()
        hint(appError.details)
      }
      break

    case ErrorCode.PAYMENT_FAILED:
      error('Payment Processing Failed')
      hint('Please try again or check your wallet connection')
      break

    case ErrorCode.API_ERROR:
      error('API Error')
      hint(appError.message)
      break

    case ErrorCode.NOT_FOUND:
      warning('Not Found')
      hint(appError.message)
      break

    case ErrorCode.CANCELLED:
      warning(appError.message)
      break

    default:
      error(appError.message)
  }

  blankLine()
}

export function extractErrorMessage(err: unknown): string {
  if (err instanceof AppError) {
    return err.message
  }
  if (err instanceof Error) {
    return err.message
  }
  return 'Unknown error'
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError
}

export function isErrorCode(err: unknown, code: ErrorCode): boolean {
  return isAppError(err) && err.code === code
}

export function is402PaymentError(err: unknown): boolean {
  if (err && typeof err === 'object' && 'statusCode' in err) {
    return (err as any).statusCode === 402
  }
  return false
}

export function transformPaymentError(err: unknown): AppError {
  const errorData = err as any
  
  // Check if it's a 402 payment error
  if (errorData.statusCode === 402) {
    let details: string | undefined
    try {
      if (errorData.responseBody) {
        const parsed = JSON.parse(errorData.responseBody)
        details = parsed.error
      }
    } catch {
      // Ignore JSON parse errors
    }
    
    return createError({
      code: ErrorCode.INSUFFICIENT_FUNDS,
      message: 'Insufficient USDC balance to complete this request',
      details,
      originalError: err
    })
  }
  
  // Check for other payment-related errors
  if (errorData.message?.includes('Payment Required') || 
      errorData.message?.includes('payment') ||
      errorData.message?.includes('402')) {
    return createError({
      code: ErrorCode.INSUFFICIENT_FUNDS,
      message: 'Payment required - insufficient funds',
      originalError: err
    })
  }
  
  // Default to payment failed
  return createError({
    code: ErrorCode.PAYMENT_FAILED,
    message: 'Payment processing failed',
    originalError: err
  })
}

