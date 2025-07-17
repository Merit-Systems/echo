// Stripe Customer Management

import { db } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || 'test_secret_stripe_key',
  {
    apiVersion: '2025-05-28.basil',
  }
);

// Get Or Create Customer by User ID
export async function getOrCreateCustomer(
  userId: string
): Promise<Stripe.Customer> {
  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  let stripeCustomerId = user.stripeCustomerId;
  let stripeCustomer: Stripe.Customer | Stripe.DeletedCustomer | null = null;

  if (!stripeCustomerId) {
    // Create customer if it doesn't exist
    const newCustomer = await stripe.customers.create({
      email: user.email,
    });
    await db.user.update({
      where: {
        id: userId,
      },
      data: {
        stripeCustomerId: newCustomer.id,
      },
    });
    stripeCustomerId = newCustomer.id;
    stripeCustomer = newCustomer;
  }

  if (!stripeCustomer) {
    const fetchedCustomer = await stripe.customers.retrieve(stripeCustomerId);

    if (fetchedCustomer.deleted) {
      throw new Error('Customer has been deleted');
    }

    stripeCustomer = fetchedCustomer;
  }

  return stripeCustomer;
}
