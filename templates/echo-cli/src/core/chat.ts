import { text, isCancel } from '@clack/prompts'
import chalk from 'chalk'
import { getAIProvider } from '@/auth'
import { AGENT_NAME, MESSAGE_MODES } from '@/constants'
import { storage } from '@/config'
import { streamText, ModelMessage } from 'ai'
import { consumeStream, createThinkingSpinner, isAuthenticated, displayAppError, isErrorCode, ErrorCode } from '@/utils'
import { warning, hint, blankLine, write, newLine, error, header } from '@/print'
import { createThread, addMessageToThread, selectThreadToResume } from './history'
import { Thread } from '@/validation'

async function runChatLoop(thread: Thread, isResume: boolean = false): Promise<void> {
  const authenticated = await isAuthenticated()

  if (!authenticated) {
    warning('Not authenticated. Please run: echodex login')
    return
  }

  let provider
  try {
    provider = await getAIProvider()
  } catch (err) {
    if (err instanceof Error) {
      displayAppError(err as any)
    } else {
      error('Failed to initialize AI provider')
    }
    return
  }

  if (!provider) {
    error('Failed to initialize AI provider')
    return
  }

  const conversationHistory: ModelMessage[] = thread.messages.map((msg) => ({
    role: msg.role,
    content: msg.content
  }))

  const mode = MESSAGE_MODES.CHAT
  const modeDisplay = mode === MESSAGE_MODES.CHAT ? 'Chat' : 'Agent'
  
  header(`${AGENT_NAME} - ${modeDisplay}${isResume ? ' (Resumed)' : ''}`)
  
  // Display previous messages if resuming
  if (isResume && thread.messages.length > 0) {
    hint('Previous conversation:')
    blankLine()
    
    thread.messages.forEach((msg) => {
      const displayName = msg.role === 'user' ? 'You' : AGENT_NAME
      const color = msg.role === 'user' ? chalk.green : chalk.blue
      write(color(`${displayName}: `))
      write(`${msg.content}\n`)
    })
    
    blankLine()
  }
  
  hint(`Type "exit" to quit.`)
  hint(`Using model: ${thread.model}\n`)

  while (true) {
    const userInput = await text({
      message: 'You:',
      placeholder: 'Type your message...'
    })

    if (isCancel(userInput)) {
      newLine()
      blankLine()
      break
    }

    if (typeof userInput !== 'string') {
      break
    }

    if (userInput.toLowerCase() === 'exit') {
      blankLine()
      break
    }

    conversationHistory.push({
      role: 'user',
      content: userInput
    })

    await addMessageToThread(thread, 'user', userInput, mode)

    const spinner = createThinkingSpinner()

    try {
      const stream = streamText({
        model: provider(thread.model),
        messages: conversationHistory,
      })

      const assistantMessage = await consumeStream(stream.textStream, (chunk, isFirst) => {
        if (isFirst) {
          spinner.stop()
          write(chalk.blue(`${AGENT_NAME}: `))
        }
        write(chunk)
      })

      conversationHistory.push({
        role: 'assistant',
        content: assistantMessage
      })

      await addMessageToThread(thread, 'assistant', assistantMessage, mode)

      newLine()
      newLine()
    } catch (err) {
      spinner.stop()
      newLine()

      if (isErrorCode(err, ErrorCode.INSUFFICIENT_FUNDS) || isErrorCode(err, ErrorCode.WRONG_CHAIN)) {
        return
      }

      if (isErrorCode(err, ErrorCode.PAYMENT_FAILED)) {
        error('Payment processing failed')
        hint('Please try again or check your wallet connection')
        blankLine()
        return
      }

      displayAppError(err as any)
    }
  }
}

export async function startChatSession(): Promise<void> {
  const model = await storage.getModel()
  const thread = await createThread(model)
  await runChatLoop(thread)
}

export async function resumeChatSession(): Promise<void> {
  const thread = await selectThreadToResume()
  
  if (!thread) {
    return
  }
  
  await runChatLoop(thread, true)
}
