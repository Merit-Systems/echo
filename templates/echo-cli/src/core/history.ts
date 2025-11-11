import { storage, StorageType } from '@/config'
import { Thread, ThreadsSchema, ThreadMessage, Model } from '@/validation'
import { randomUUID } from 'crypto'
import { select, isCancel } from '@clack/prompts'
import { info, warning, success, error, label, hint, blankLine } from '@/print'
import { MESSAGE_MODES } from '@/constants'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { displayAppError, createError, ErrorCode } from '@/utils'

const THREADS_STORAGE_KEY = 'conversation_threads'

export async function createThread(model: Model): Promise<Thread> {
  const now = new Date().toISOString()
  return {
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
    messages: [],
    model
  }
}

export async function getThreads(): Promise<Thread[]> {
  try {
    const threads = await storage.get<Thread[]>(THREADS_STORAGE_KEY, {
      type: StorageType.NORMAL,
      schema: ThreadsSchema
    })
    return threads || []
  } catch {
    return []
  }
}

export async function getThread(threadId: string): Promise<Thread | null> {
  const threads = await getThreads()
  return threads.find(t => t.id === threadId) || null
}

export async function saveThread(thread: Thread): Promise<void> {
  const threads = await getThreads()
  const existingIndex = threads.findIndex(t => t.id === thread.id)
  
  thread.updatedAt = new Date().toISOString()
  
  if (existingIndex >= 0) {
    threads[existingIndex] = thread
  } else {
    threads.push(thread)
  }
  
  await storage.set(THREADS_STORAGE_KEY, threads, {
    type: StorageType.NORMAL
  })
}

export async function addMessageToThread(
  thread: Thread,
  role: 'user' | 'assistant',
  content: string,
  mode: typeof MESSAGE_MODES.CHAT | typeof MESSAGE_MODES.AGENT = MESSAGE_MODES.CHAT
): Promise<void> {
  const message: ThreadMessage = {
    role,
    content,
    mode,
    timestamp: new Date().toISOString()
  }
  
  thread.messages.push(message)
  await saveThread(thread)
}

export async function showConversationHistory(): Promise<void> {
  const threads = await getThreads()
  
  if (threads.length === 0) {
    info('No conversation history found.')
    return
  }
  
  info(`Found ${threads.length} conversation thread${threads.length > 1 ? 's' : ''}:\n`)
  
  threads
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .forEach((thread, index) => {
      const date = new Date(thread.createdAt).toLocaleString()
      const messageCount = thread.messages.length
      const preview = thread.messages[0]?.content.slice(0, 60) || 'Empty thread'
      
      label(`${index + 1}.`, `${date}`)
      hint(`   Model: ${thread.model}`)
      hint(`   Messages: ${messageCount}`)
      hint(`   Preview: ${preview}${preview.length >= 60 ? '...' : ''}`)
      blankLine()
    })
}

export async function exportConversationHistory(): Promise<boolean> {
  try {
    const threads = await getThreads()
    
    if (threads.length === 0) {
      warning('No conversation history to export.')
      return false
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `echodex-history-${timestamp}.json`
    const filepath = join(process.cwd(), filename)
    
    await writeFile(filepath, JSON.stringify(threads, null, 2), 'utf-8')
    
    success(`Exported ${threads.length} thread${threads.length > 1 ? 's' : ''} to: ${filename}`)
    return true
  } catch (err) {
    displayAppError(createError({
      code: ErrorCode.API_ERROR,
      message: 'Failed to export history',
      originalError: err
    }))
    return false
  }
}

export async function selectThreadToResume(): Promise<Thread | null> {
  const threads = await getThreads()
  
  if (threads.length === 0) {
    warning('No conversation history found.')
    return null
  }
  
  const sortedThreads = threads.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
  
  const choices = sortedThreads.map(thread => {
    const date = new Date(thread.createdAt).toLocaleString()
    const preview = thread.messages[0]?.content.slice(0, 50) || 'Empty thread'
    return {
      value: thread.id,
      label: `${date} - ${preview}${preview.length >= 50 ? '...' : ''}`,
      hint: `${thread.messages.length} messages, ${thread.model}`
    }
  })
  
  const selectedId = await select({
    message: 'Select a conversation to resume:',
    options: choices
  })
  
  if (isCancel(selectedId)) {
    warning('Cancelled.')
    return null
  }
  
  return threads.find(t => t.id === selectedId) || null
}

export async function clearConversationHistory(): Promise<boolean> {
  try {
    const threads = await getThreads()
    
    if (threads.length === 0) {
      warning('No conversation history to clear.')
      return false
    }
    
    await storage.set(THREADS_STORAGE_KEY, [], {
      type: StorageType.NORMAL
    })
    
    success(`Cleared ${threads.length} thread${threads.length > 1 ? 's' : ''} from history.`)
    return true
  } catch (err) {
    displayAppError(createError({
      code: ErrorCode.API_ERROR,
      message: 'Failed to clear history',
      originalError: err
    }))
    return false
  }
}

