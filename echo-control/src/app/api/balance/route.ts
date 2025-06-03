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

// GET /api/balance - Get authenticated user balance (optionally for a specific app)
export async function GET(request: NextRequest) {
  try {
    const { user, echoApp } = await getAuthenticatedUser(request)
    const { searchParams } = new URL(request.url)
    let echoAppId = searchParams.get('echoAppId')

    // If authenticated via API key and no specific app requested, use the API key's app
    if (!echoAppId && echoApp) {
      echoAppId = echoApp.id
    }

    // Calculate balance from payments and transactions
    const paymentsFilter: any = {
      userId: user.id,
      status: 'completed',
    }
    
    const transactionsFilter: any = {
      userId: user.id,
    }

    // If echoAppId is provided, filter by app
    if (echoAppId) {
      paymentsFilter.echoAppId = echoAppId
      transactionsFilter.echoAppId = echoAppId
    }

    const payments = await db.payment.aggregate({
      where: paymentsFilter,
      _sum: {
        amount: true,
      },
    })

    const transactions = await db.llmTransaction.aggregate({
      where: transactionsFilter,
      _sum: {
        cost: true,
      },
    })

    const totalCredits = (payments._sum.amount || 0) / 100 // Convert from cents
    const totalSpent = Number(transactions._sum.cost || 0)
    const balance = totalCredits - totalSpent

    return NextResponse.json({
      balance: balance.toFixed(2),
      totalCredits: totalCredits.toFixed(2),
      totalSpent: totalSpent.toFixed(2),
      currency: 'USD',
      echoAppId: echoAppId || null,
    })
  } catch (error) {
    console.error('Error fetching balance:', error)
    
    if (error instanceof Error && (error.message === 'Not authenticated' || error.message.includes('Invalid'))) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/balance - Increment/Decrement balance for authenticated user
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    const body = await request.json()
    const { amount, operation, description } = body

    if (!amount || !operation) {
      return NextResponse.json(
        { error: 'Amount and operation are required' },
        { status: 400 }
      )
    }

    if (!['increment', 'decrement'].includes(operation)) {
      return NextResponse.json(
        { error: 'Operation must be increment or decrement' },
        { status: 400 }
      )
    }

    const amountInCents = Math.round(Math.abs(amount) * 100)

    if (operation === 'increment') {
      // Add credits via payment record
      await db.payment.create({
        data: {
          stripePaymentId: `manual_${Date.now()}_${user.id}`,
          amount: amountInCents,
          currency: 'usd',
          status: 'completed',
          description: description || 'Manual credit adjustment',
          userId: user.id,
        },
      })
    } else {
      // Deduct credits via LLM transaction record
      await db.llmTransaction.create({
        data: {
          model: 'manual-adjustment',
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
          cost: amount,
          status: 'success',
          prompt: description || 'Manual debit adjustment',
          userId: user.id,
        },
      })
    }

    // Return updated balance
    const payments = await db.payment.aggregate({
      where: {
        userId: user.id,
        status: 'completed',
      },
      _sum: {
        amount: true,
      },
    })

    const transactions = await db.llmTransaction.aggregate({
      where: { userId: user.id },
      _sum: {
        cost: true,
      },
    })

    const totalCredits = (payments._sum.amount || 0) / 100
    const totalSpent = Number(transactions._sum.cost || 0)
    const balance = totalCredits - totalSpent

    return NextResponse.json({
      success: true,
      operation,
      amount: amount.toFixed(2),
      balance: balance.toFixed(2),
      totalCredits: totalCredits.toFixed(2),
      totalSpent: totalSpent.toFixed(2),
      currency: 'USD',
    })
  } catch (error) {
    console.error('Error updating balance:', error)
    
    if (error instanceof Error && error.message === 'Not authenticated') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 