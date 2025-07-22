export interface CreateProductRequest {
  appId: string;
  name: string;
  description?: string;
  price: number;
}

export interface CreatePackageRequest {
  appId: string;
  name: string;
  description?: string;
  productIds: string[];
}

export interface EnrollSubscriptionRequest {
  type: 'product' | 'package';
  id: string;
  appId: string;
}

export interface SubscriptionProductInfo {
  id: string;
  name: string;
  description?: string;
  stripeProductId: string;
  stripePriceId: string;
  price: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPackageInfo {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  products: SubscriptionProductInfo[];
  totalPrice: number;
}

export interface UserSubscription {
  id: string;
  stripeSubscriptionId: string;
  status: string;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  createdAt: Date;
  type: 'package' | 'product';
  package: SubscriptionPackageInfo | null;
  products: SubscriptionProductInfo[];
}

export interface SubscriptionCreateResponse {
  success: boolean;
  subscriptionId: string;
  stripeSubscriptionId: string;
  paymentUrl: string;
  message: string;
}
