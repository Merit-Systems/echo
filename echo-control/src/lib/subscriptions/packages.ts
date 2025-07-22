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
      Permission.MANAGE_BILLING
    );

    if (!hasPermission) {
      throw new Error(
        'You do not have permission to create packages for this app'
      );
    }

    // Get app info
    const app = await db.echoApp.findUnique({
      where: { id: appId },
      select: { id: true, name: true },
    });

    if (!app) {
      throw new Error('App not found');
    }

    // Verify all products exist and belong to this app
    const products = await db.product.findMany({
      where: {
        id: { in: productIds },
        echoAppId: appId,
        isArchived: false,
      },
    });

    if (products.length !== productIds.length) {
      throw new Error('One or more products not found or not accessible');
    }

    // Create the subscription package
    const subscriptionPackage = await db.subscriptionPackage.create({
      data: {
        name,
        description,
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
      (sum: number, spp: unknown) =>
        sum + Number((spp as { product: { price: unknown } }).product.price),
      0
    );

    const packageInfo: SubscriptionPackageInfo = {
      id: completePackage!.id,
      name: completePackage!.name,
      description: completePackage!.description || undefined,
      createdAt: completePackage!.createdAt.toISOString(),
      updatedAt: completePackage!.updatedAt.toISOString(),
      products: completePackage!.subscriptionPackageProducts.map(
        (spp: unknown) => ({
          id: (spp as { product: { id: string } }).product.id,
          name: (spp as { product: { name: string } }).product.name,
          description:
            (spp as { product: { description: string | null } }).product
              .description || undefined,
          stripeProductId: (spp as { product: { stripeProductId: string } })
            .product.stripeProductId,
          stripePriceId: (spp as { product: { stripePriceId: string } }).product
            .stripePriceId,
          price: Number((spp as { product: { price: unknown } }).product.price),
          currency: (spp as { product: { currency: string } }).product.currency,
          createdAt: (
            spp as { product: { createdAt: Date } }
          ).product.createdAt.toISOString(),
          updatedAt: (
            spp as { product: { updatedAt: Date } }
          ).product.updatedAt.toISOString(),
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
   * Get all subscription packages for an app
   */
  static async getAppPackages(
    userId: string,
    appId: string
  ): Promise<SubscriptionPackageInfo[]> {
    // Check if user has permission to view the app
    const hasPermission = await PermissionService.hasPermission(
      userId,
      appId,
      Permission.READ_APP
    );

    if (!hasPermission) {
      throw new Error(
        'You do not have permission to view packages for this app'
      );
    }

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
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return packages.map((pkg: unknown) => {
      const products = (
        pkg as { subscriptionPackageProducts: unknown[] }
      ).subscriptionPackageProducts.map((spp: unknown) => ({
        id: (spp as { product: { id: string } }).product.id,
        name: (spp as { product: { name: string } }).product.name,
        description:
          (spp as { product: { description: string | null } }).product
            .description || undefined,
        stripeProductId: (spp as { product: { stripeProductId: string } })
          .product.stripeProductId,
        stripePriceId: (spp as { product: { stripePriceId: string } }).product
          .stripePriceId,
        price: Number((spp as { product: { price: unknown } }).product.price),
        currency: (spp as { product: { currency: string } }).product.currency,
        createdAt: (
          spp as { product: { createdAt: Date } }
        ).product.createdAt.toISOString(),
        updatedAt: (
          spp as { product: { updatedAt: Date } }
        ).product.updatedAt.toISOString(),
      }));

      const totalPrice = products.reduce(
        (sum: number, product: { price: number }) => sum + product.price,
        0
      );

      return {
        id: (pkg as { id: string }).id,
        name: (pkg as { name: string }).name,
        description:
          (pkg as { description: string | null }).description || undefined,
        createdAt: (pkg as { createdAt: Date }).createdAt.toISOString(),
        updatedAt: (pkg as { updatedAt: Date }).updatedAt.toISOString(),
        products,
        totalPrice,
      };
    });
  }

  /**
   * Get active subscription packages for an app (customer view)
   */
  static async getActiveAppPackages(
    userId: string,
    appId: string
  ): Promise<SubscriptionPackageInfo[]> {
    // Check if user has permission to view the app
    const hasPermission = await PermissionService.hasPermission(
      userId,
      appId,
      Permission.READ_APP
    );

    if (!hasPermission) {
      throw new Error(
        'You do not have permission to view packages for this app'
      );
    }

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

    return packages.map((pkg: unknown) => {
      const products = (
        pkg as { subscriptionPackageProducts: unknown[] }
      ).subscriptionPackageProducts
        .filter(
          (spp: unknown) =>
            !(spp as { product: { isArchived: boolean } }).product.isArchived
        )
        .map((spp: unknown) => ({
          id: (spp as { product: { id: string } }).product.id,
          name: (spp as { product: { name: string } }).product.name,
          description:
            (spp as { product: { description: string | null } }).product
              .description || undefined,
          stripeProductId: (spp as { product: { stripeProductId: string } })
            .product.stripeProductId,
          stripePriceId: (spp as { product: { stripePriceId: string } }).product
            .stripePriceId,
          price: Number((spp as { product: { price: unknown } }).product.price),
          currency: (spp as { product: { currency: string } }).product.currency,
          createdAt: (
            spp as { product: { createdAt: Date } }
          ).product.createdAt.toISOString(),
          updatedAt: (
            spp as { product: { updatedAt: Date } }
          ).product.updatedAt.toISOString(),
        }));

      const totalPrice = products.reduce(
        (sum: number, product: { price: number }) => sum + product.price,
        0
      );

      return {
        id: (pkg as { id: string }).id,
        name: (pkg as { name: string }).name,
        description:
          (pkg as { description: string | null }).description || undefined,
        createdAt: (pkg as { createdAt: Date }).createdAt.toISOString(),
        updatedAt: (pkg as { updatedAt: Date }).updatedAt.toISOString(),
        products,
        totalPrice,
      };
    });
  }
}
