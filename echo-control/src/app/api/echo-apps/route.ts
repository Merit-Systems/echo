import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, getCurrentUserByApiKey } from '@/lib/auth'

// Helper function to get user from either Clerk or API key
async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // API key authentication
    const authResult = await getCurrentUserByApiKey(request)
    return { user: authResult.user, echoApp: authResult.echoApp }
  } else {
    // Clerk authentication
    const user = await getCurrentUser()
    return { user, echoApp: null }
  }
}

// GET /api/echo-apps - List echo apps for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const { user } = await getAuthenticatedUser(request)

    const echoApps = await db.echoApp.findMany({
      where: { userId: user.id },
      include: {
        apiKeys: {
          where: { isActive: true },
          select: { id: true, name: true, createdAt: true },
        },
        llmTransactions: {
          select: { id: true, totalTokens: true, cost: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            apiKeys: true,
            llmTransactions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate total usage and costs for each app
    const appsWithStats = await Promise.all(
      echoApps.map(async (app) => {
        const stats = await db.llmTransaction.aggregate({
          where: { echoAppId: app.id },
          _sum: {
            totalTokens: true,
            cost: true,
          },
        })

        return {
          ...app,
          totalTokens: stats._sum.totalTokens || 0,
          totalCost: stats._sum.cost || 0,
        }
      })
    )

    return NextResponse.json({ echoApps: appsWithStats })
  } catch (error) {
    console.error('Error fetching echo apps:', error)
    
    if (error instanceof Error && (error.message === 'Not authenticated' || error.message.includes('Invalid'))) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/echo-apps - Create a new echo app for the authenticated user
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const echoApp = await db.echoApp.create({
      data: {
        name,
        description: description || null,
        userId: user.id,
      },
      include: {
        apiKeys: true,
        _count: {
          select: {
            apiKeys: true,
            llmTransactions: true,
          },
        },
      },
    })

    return NextResponse.json({ echoApp }, { status: 201 })
  } catch (error) {
    console.error('Error creating echo app:', error)
    
    if (error instanceof Error && error.message === 'Not authenticated') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 