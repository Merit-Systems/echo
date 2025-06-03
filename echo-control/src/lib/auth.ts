import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from './db'
import { NextRequest } from 'next/server'

export async function getCurrentUser() {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('Not authenticated')
  }

  // Get user from Clerk
  const clerkUser = await currentUser()
  
  if (!clerkUser) {
    throw new Error('Clerk user not found')
  }

  // Try to find existing user in our database
  let user = await db.user.findUnique({
    where: { clerkId: userId }
  })

  // If user doesn't exist, create them
  if (!user) {
    user = await db.user.create({
      data: {
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
      }
    })
  }

  return user
}

export async function getCurrentUserByApiKey(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Invalid authorization header')
  }

  const apiKey = authHeader.substring(7) // Remove 'Bearer ' prefix

  // Find the API key in the database
  const apiKeyRecord = await db.apiKey.findUnique({
    where: { 
      key: apiKey,
      isActive: true 
    },
    include: {
      user: true,
      echoApp: true
    }
  })

  if (!apiKeyRecord) {
    throw new Error('Invalid or inactive API key')
  }

  return {
    user: apiKeyRecord.user,
    apiKey: apiKeyRecord,
    echoApp: apiKeyRecord.echoApp
  }
}

export async function requireAuth() {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('Authentication required')
  }
  
  return userId
} 