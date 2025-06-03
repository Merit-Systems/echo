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

// GET /api/echo-apps/[id] - Get a specific echo app by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await getAuthenticatedUser(request)
    const { id } = params

    const echoApp = await db.echoApp.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        apiKeys: {
          where: { isActive: true },
          select: { id: true, name: true, createdAt: true },
        },
        llmTransactions: {
          select: { id: true, totalTokens: true, cost: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            apiKeys: true,
            llmTransactions: true,
          },
        },
      },
    })

    if (!echoApp) {
      return NextResponse.json({ error: 'Echo app not found' }, { status: 404 })
    }

    // Calculate total usage and costs
    const stats = await db.llmTransaction.aggregate({
      where: { echoAppId: echoApp.id },
      _sum: {
        totalTokens: true,
        cost: true,
      },
    })

    const appWithStats = {
      ...echoApp,
      totalTokens: stats._sum.totalTokens || 0,
      totalCost: stats._sum.cost || 0,
    }

    return NextResponse.json({ echoApp: appWithStats })
  } catch (error) {
    console.error('Error fetching echo app:', error)
    
    if (error instanceof Error && (error.message === 'Not authenticated' || error.message.includes('Invalid'))) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/echo-apps/[id] - Update echo app for authenticated user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    // @ts-ignore - Next.js 15+ requires awaiting params, despite TS warning
    const { id } = await params
    const body = await request.json()
    const { name, description, isActive } = body

    // First check if the app exists and belongs to the user
    const existingApp = await db.echoApp.findFirst({
      where: { 
        id,
        userId: user.id 
      }
    })

    if (!existingApp) {
      return NextResponse.json({ error: 'Echo app not found' }, { status: 404 })
    }

    const echoApp = await db.echoApp.update({
      where: { id },
      data: {
        name,
        description,
        isActive,
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

    return NextResponse.json({ echoApp })
  } catch (error) {
    console.error('Error updating echo app:', error)
    
    if (error instanceof Error && error.message === 'Not authenticated') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 