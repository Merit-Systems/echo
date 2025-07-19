import { db } from '@/lib/db';
import { PermissionService } from '@/lib/permissions/service';
import { Permission } from '@/lib/permissions/types';
import { CreatePackageRequest, SubscriptionPackageInfo } from './types';

export class SubscriptionPackageService {
  /**
   * Create a subscription package that groups multiple products
   */
  static async createPackage(
    userId: string,
    request: CreatePackageRequest
  ): Promise<{
    package: SubscriptionPackageInfo;
    appId: string;
    appName: string;
  }> {
    const { appId, name, description, productIds } = request;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('Package name is required');
    }

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      throw new Error('At least one product ID is required');
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

    // Verify the app exists
    const app = await db.echoApp.findUnique({
      where: { id: appId },
      select: { id: true, name: true },
    });

    if (!app) {
      throw new Error('App not found');
    }

    // Verify all products exist and belong to the app
    const products = await db.product.findMany({
      where: {
        id: { in: productIds },
        echoAppId: appId,
        isArchived: false,
      },
    });

    if (products.length !== productIds.length) {
      throw new Error(
        'One or more products not found or do not belong to this app'
      );
    }

    // Create the subscription package
    const subscriptionPackage = await db.subscriptionPackage.create({
      data: {
        name: name.trim(),
        description: description?.trim() || undefined,
        echoAppId: appId,
      },
    });

    // Create the package-product relationships
    await Promise.all(
      productIds.map((productId: string) =>
        db.subscriptionPackageProduct.create({
          data: {
            subscriptionPackageId: subscriptionPackage.id,
            productId,
          },
        })
      )
    );

    // Fetch the complete package with products for response
    const completePackage = await db.subscriptionPackage.findUnique({
      where: { id: subscriptionPackage.id },
      include: {
        subscriptionPackageProducts: {
          include: {
            product: true,
          },
        },
      },
    });

    const totalPrice = completePackage!.subscriptionPackageProducts.reduce(
      (sum: number, spp: any) => sum + Number(spp.product.price),
      0
    );

    const packageInfo: SubscriptionPackageInfo = {
      id: completePackage!.id,
      name: completePackage!.name,
      description: completePackage!.description || undefined,
      isActive: completePackage!.isActive,
      createdAt: completePackage!.createdAt.toISOString(),
      updatedAt: completePackage!.updatedAt.toISOString(),
      products: completePackage!.subscriptionPackageProducts.map(
        (spp: any) => ({
          id: spp.product.id,
          name: spp.product.name,
          description: spp.product.description || undefined,
          stripeProductId: spp.product.stripeProductId,
          stripePriceId: spp.product.stripePriceId,
          price: Number(spp.product.price),
          currency: spp.product.currency,
          isActive: spp.product.isActive,
          createdAt: spp.product.createdAt.toISOString(),
          updatedAt: spp.product.updatedAt.toISOString(),
        })
      ),
      totalPrice,
    };

    return {
      package: packageInfo,
      appId: app.id,
      appName: app.name,
    };
  }

  /**
   * Get all subscription packages for an app (owner only)
   */
  static async getAppPackages(
    userId: string,
    appId: string
  ): Promise<SubscriptionPackageInfo[]> {
    // Check if user has permission to view the app's packages
    const hasPermission = await PermissionService.hasPermission(
      userId,
      appId,
      Permission.EDIT_APP
    );

    if (!hasPermission) {
      throw new Error('Permission denied');
    }

    // Get all subscription packages for the app
    const packages = await db.subscriptionPackage.findMany({
      where: {
        echoAppId: appId,
        isArchived: false,
      },
      include: {
        subscriptionPackageProducts: {
          include: {
            product: {
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
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return packages.map((pkg: any) => {
      const products = pkg.subscriptionPackageProducts.map((spp: any) => ({
        id: spp.product.id,
        name: spp.product.name,
        description: spp.product.description || undefined,
        stripeProductId: spp.product.stripeProductId,
        stripePriceId: spp.product.stripePriceId,
        price: Number(spp.product.price),
        currency: spp.product.currency,
        isActive: spp.product.isActive,
        createdAt: spp.product.createdAt.toISOString(),
        updatedAt: spp.product.updatedAt.toISOString(),
      }));

      const totalPrice = products.reduce(
        (sum: number, product: any) => sum + product.price,
        0
      );

      return {
        id: pkg.id,
        name: pkg.name,
        description: pkg.description || undefined,
        isActive: pkg.isActive,
        createdAt: pkg.createdAt.toISOString(),
        updatedAt: pkg.updatedAt.toISOString(),
        products,
        totalPrice,
      };
    });
  }

  /**
   * Get public packages for an app (accessible to customers)
   */
  static async getPublicPackages(
    appId: string
  ): Promise<SubscriptionPackageInfo[]> {
    // Verify the app exists and is active
    const app = await db.echoApp.findUnique({
      where: { id: appId },
      select: { id: true, isActive: true },
    });

    if (!app || !app.isActive) {
      throw new Error('App not found or inactive');
    }

    // Get all active subscription packages for the app
    const packages = await db.subscriptionPackage.findMany({
      where: {
        echoAppId: appId,
        isArchived: false,
        isActive: true,
      },
      include: {
        subscriptionPackageProducts: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                stripeProductId: true,
                stripePriceId: true,
                price: true,
                currency: true,
                isActive: true,
                isArchived: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return packages.map((pkg: any) => {
      const products = pkg.subscriptionPackageProducts
        .filter((spp: any) => spp.product.isActive && !spp.product.isArchived)
        .map((spp: any) => ({
          id: spp.product.id,
          name: spp.product.name,
          description: spp.product.description || undefined,
          stripeProductId: spp.product.stripeProductId,
          stripePriceId: spp.product.stripePriceId,
          price: Number(spp.product.price),
          currency: spp.product.currency,
          isActive: spp.product.isActive,
          createdAt: spp.product.createdAt.toISOString(),
          updatedAt: spp.product.updatedAt.toISOString(),
        }));

      const totalPrice = products.reduce(
        (sum: number, product: any) => sum + product.price,
        0
      );

      return {
        id: pkg.id,
        name: pkg.name,
        description: pkg.description || undefined,
        isActive: pkg.isActive,
        createdAt: pkg.createdAt.toISOString(),
        updatedAt: pkg.updatedAt.toISOString(),
        products,
        totalPrice,
      };
    });
  }
}
