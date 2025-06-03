import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, getCurrentUserByApiKey } from '@/lib/auth'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

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

// POST /api/stripe/payment-link - Generate real Stripe payment link for authenticated user
export async function POST(request: NextRequest) {
  try {
    const { user, echoApp: authEchoApp } = await getAuthenticatedUser(request)
    const body = await request.json()
    let { amount, description = 'Echo Credits', echoAppId } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 })
    }

    // If authenticated via API key and no echoAppId provided, use the API key's app
    if (!echoAppId && authEchoApp) {
      echoAppId = authEchoApp.id
    }

    if (!echoAppId) {
      return NextResponse.json({ error: 'Echo App ID is required' }, { status: 400 })
    }

    // Verify the echo app exists and belongs to the user
    const echoApp = await db.echoApp.findFirst({
      where: {
        id: echoAppId,
        userId: user.id,
      },
    })

    if (!echoApp) {
      return NextResponse.json({ error: 'Echo app not found or access denied' }, { status: 404 })
    }

    // Convert amount to cents for Stripe
    const amountInCents = Math.round(amount * 100)

    // Create Stripe product
    const product = await stripe.products.create({
      name: `${description} - ${echoApp.name}`,
      description: `${description} for ${echoApp.name} - ${amount} USD`,
    })

    // Create Stripe price
    const price = await stripe.prices.create({
      unit_amount: amountInCents,
      currency: 'usd',
      product: product.id,
    })

    // Create Stripe payment link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
        echoAppId,
        description,
      },
      after_completion: {
        type: 'redirect',
        redirect: {
          url: process.env.NEXTAUTH_URL + `/apps/${echoAppId}?payment=success`,
        },
      },
    })

    // Create pending payment record
    const payment = await db.payment.create({
      data: {
        stripePaymentId: paymentLink.id,
        amount: amountInCents,
        currency: 'usd',
        status: 'pending',
        description: `${description} for ${echoApp.name}`,
        userId: user.id,
        echoAppId,
      },
    })

    return NextResponse.json({ 
      paymentLink: {
        id: paymentLink.id,
        url: paymentLink.url,
        amount: amountInCents,
        currency: 'usd',
        status: 'pending',
        created: Math.floor(Date.now() / 1000),
        metadata: {
          userId: user.id,
          echoAppId,
          description,
        },
      },
      payment
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating payment link:', error)
    
    if (error instanceof Error && error.message === 'Not authenticated') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ 
        error: 'Stripe error: ' + error.message 
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 