import Stripe from 'stripe';
import { db } from '@/lib/db';
import { PermissionService } from '@/lib/permissions/service';
import { Permission } from '@/lib/permissions/types';
import { CreateProductRequest, SubscriptionProductInfo } from './types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export class SubscriptionProductService {
  /**
   * Create a new subscription product with Stripe integration
   */
  static async createProduct(
    userId: string,
    request: CreateProductRequest
  ): Promise<{
    product: {
      id: string;
      name: string;
      description: string | null;
      [key: string]: unknown;
    };
    price: {
      id: string;
      unit_amount: number | null;
      currency: string;
      [key: string]: unknown;
    };
    dbProduct: {
      id: string;
      name: string;
      description: string | null;
      price: unknown;
    };
    appId: string;
    appName: string;
  }> {
    const { appId, name, description, price } = request;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('Product name is required');
    }

    if (!price || typeof price !== 'number' || price <= 0) {
      throw new Error('Valid price is required (must be a positive number)');
    }

    // Check if user has permission to manage the app (owner permission)
    const hasPermission = await PermissionService.hasPermission(
      userId,
      appId,
      Permission.EDIT_APP
    );

    if (!hasPermission) {
      throw new Error('Permission denied');
    }

    // Get app details to use in product creation
    const app = await db.echoApp.findUnique({
      where: { id: appId },
      select: { id: true, name: true, description: true },
    });

    if (!app) {
      throw new Error('App not found');
    }

    // Convert price to cents for Stripe
    const amountInCents = Math.round(price * 100);

    // Create Stripe product
    const product = await stripe.products.create({
      name: name.trim(),
      description: description?.trim() || `Subscription access to ${app.name}`,
      metadata: {
        appId: app.id,
        appName: app.name,
        productName: name.trim(),
      },
    });

    // Create Stripe price for the product
    const stripePrice = await stripe.prices.create({
      unit_amount: amountInCents,
      currency: 'usd',
      product: product.id,
      recurring: {
        interval: 'month', // Default to monthly subscription
      },
      metadata: {
        appId: app.id,
        appName: app.name,
      },
    });

    // Store the product in our database
    const dbProduct = await db.product.create({
      data: {
        name: name.trim(),
        description: description?.trim() || undefined,
        stripeProductId: product.id,
        stripePriceId: stripePrice.id,
        price: price,
        currency: 'usd',
        echoAppId: app.id,
      },
    });

    return {
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        metadata: product.metadata,
      },
      price: {
        id: stripePrice.id,
        unit_amount: stripePrice.unit_amount,
        currency: stripePrice.currency,
        recurring: stripePrice.recurring,
        metadata: stripePrice.metadata,
      },
      dbProduct: {
        id: dbProduct.id,
        name: dbProduct.name,
        description: dbProduct.description,
        price: dbProduct.price,
      },
      appId: app.id,
      appName: app.name,
    };
  }

  /**
   * Get all products for an app (owner only)
   */
  static async getAppProducts(
    userId: string,
    appId: string
  ): Promise<SubscriptionProductInfo[]> {
    // Check if user has permission to view the app's products
    const hasPermission = await PermissionService.hasPermission(
      userId,
      appId,
      Permission.EDIT_APP
    );

    if (!hasPermission) {
      throw new Error('Permission denied');
    }

    // Get all products for the app from database
    const products = await db.product.findMany({
      where: {
        echoAppId: appId,
        isArchived: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    return products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description || undefined,
      stripeProductId: product.stripeProductId,
      stripePriceId: product.stripePriceId,
      price: Number(product.price),
      currency: product.currency,
      isActive: product.isActive,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }));
  }

  /**
   * Get public products for an app (accessible to customers)
   */
  static async getPublicProducts(
    appId: string
  ): Promise<SubscriptionProductInfo[]> {
    // Verify the app exists and is active
    const app = await db.echoApp.findUnique({
      where: { id: appId },
      select: { id: true, isActive: true },
    });

    if (!app || !app.isActive) {
      throw new Error('App not found or inactive');
    }

    // Get all active products for the app
    const products = await db.product.findMany({
      where: {
        echoAppId: appId,
        isArchived: false,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        stripeProductId: true,
        stripePriceId: true,
        price: true,
        currency: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description || undefined,
      stripeProductId: product.stripeProductId,
      stripePriceId: product.stripePriceId,
      price: Number(product.price),
      currency: product.currency,
      isActive: product.isActive,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }));
  }
}
