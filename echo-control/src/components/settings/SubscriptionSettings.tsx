'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Package,
  Plus,
  Calendar,
  CheckCircle,
  X,
  AlertCircle,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Product {
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

interface SubscriptionPackage {
  id: string;
  name: string;
  description?: string;
  products: Product[];
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionSettingsProps {
  appId: string;
}

interface CreateProductModalProps {
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description?: string;
    price: number;
  }) => Promise<void>;
}

interface CreatePackageModalProps {
  products: Product[];
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description?: string;
    productIds: string[];
  }) => Promise<void>;
}

function CreateProductModal({ onClose, onSubmit }: CreateProductModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !price.trim()) return;

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Price must be a valid positive number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        price: priceNum,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/75 backdrop-blur-sm overflow-y-auto h-full w-full z-50 fade-in">
      <div className="relative top-20 mx-auto p-5 border border-border w-full max-w-md shadow-lg rounded-md bg-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-card-foreground">
            Create Subscription Product
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <div className="text-sm text-destructive-foreground">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-card-foreground mb-1"
            >
              Product Name *
            </label>
            <Input
              type="text"
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Premium Access"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-card-foreground mb-1"
            >
              Description
            </label>
            <Input
              type="text"
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Monthly subscription for premium features"
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-card-foreground mb-1"
            >
              Monthly Price (USD) *
            </label>
            <Input
              type="number"
              id="price"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="9.99"
              step="0.01"
              min="0.01"
              required
              disabled={loading}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || !price.trim() || loading}
            >
              {loading ? 'Creating...' : 'Create Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreatePackageModal({
  products,
  onClose,
  onSubmit,
}: CreatePackageModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProductToggle = (productId: string) => {
    setSelectedProductIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectedProducts = products.filter(p =>
    selectedProductIds.includes(p.id)
  );
  const totalPrice = selectedProducts.reduce(
    (sum, product) => sum + Number(product.price),
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || selectedProductIds.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        productIds: selectedProductIds,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create package');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/75 backdrop-blur-sm overflow-y-auto h-full w-full z-50 fade-in">
      <div className="relative top-20 mx-auto p-5 border border-border w-full max-w-lg shadow-lg rounded-md bg-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-card-foreground">
            Create Subscription Package
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <div className="text-sm text-destructive-foreground">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="packageName"
              className="block text-sm font-medium text-card-foreground mb-1"
            >
              Package Name *
            </label>
            <Input
              type="text"
              id="packageName"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Premium Bundle"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="packageDescription"
              className="block text-sm font-medium text-card-foreground mb-1"
            >
              Description
            </label>
            <Input
              type="text"
              id="packageDescription"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Bundle of premium features at a discounted rate"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Select Products *
            </label>
            <div className="max-h-48 overflow-y-auto border border-border rounded-lg p-3 space-y-2">
              {products.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No products available. Create individual products first.
                </p>
              ) : (
                products.map(product => (
                  <div
                    key={product.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedProductIds.includes(product.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => handleProductToggle(product.id)}
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{product.name}</h4>
                      {product.description && (
                        <p className="text-xs text-muted-foreground">
                          {product.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        ${Number(product.price).toFixed(2)}
                      </span>
                      {selectedProductIds.includes(product.id) && (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {selectedProducts.length > 0 && (
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Package Total</span>
                <span className="text-lg font-bold">
                  ${totalPrice.toFixed(2)}/month
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedProducts.length} product
                {selectedProducts.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !name.trim() || selectedProductIds.length === 0 || loading
              }
            >
              {loading ? 'Creating...' : 'Create Package'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SubscriptionSettings({
  appId,
}: SubscriptionSettingsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreatePackageModal, setShowCreatePackageModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'packages'>(
    'products'
  );

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/stripe/subscriptions?appId=${appId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch products');
      }

      setProducts(result.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const response = await fetch(
        `/api/stripe/subscriptions/packages?appId=${appId}`
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch packages');
      }

      setPackages(result.packages || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
      // Don't set error here as packages might not be implemented yet
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchPackages();
  }, [appId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreateProduct = async (data: {
    name: string;
    description?: string;
    price: number;
  }) => {
    try {
      const response = await fetch('/api/stripe/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId,
          name: data.name,
          description: data.description,
          price: data.price,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create product');
      }

      // Refresh products list
      await fetchProducts();
      setShowCreateModal(false);
    } catch (error) {
      throw error; // Re-throw to be handled by modal
    }
  };

  const handleCreatePackage = async (data: {
    name: string;
    description?: string;
    productIds: string[];
  }) => {
    try {
      const response = await fetch('/api/stripe/subscriptions/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId,
          name: data.name,
          description: data.description,
          productIds: data.productIds,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create package');
      }

      // Refresh packages list
      await fetchPackages();
      setShowCreatePackageModal(false);
    } catch (error) {
      throw error; // Re-throw to be handled by modal
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading && !products.length) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Subscription Management</h3>
        <p className="text-sm text-muted-foreground">
          Create individual products and group them into subscription packages
          for your app
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="text-sm text-destructive-foreground">{error}</div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'products'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Package className="h-4 w-4 mr-2 inline" />
          Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('packages')}
          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'packages'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Layers className="h-4 w-4 mr-2 inline" />
          Packages ({packages.length})
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Package className="h-5 w-5 mr-2 text-muted-foreground" />
              <h4 className="text-sm font-semibold text-foreground">
                Individual Products ({products.length})
              </h4>
            </div>
            <Button onClick={() => setShowCreateModal(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Product
            </Button>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
              <h4 className="text-base font-semibold text-foreground mb-2">
                No products yet
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first product to start building subscription
                packages.
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Product
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map(product => (
                <div
                  key={product.id}
                  className="bg-muted/30 border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h5 className="font-semibold text-foreground">
                          {product.name}
                        </h5>
                      </div>
                      {product.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {product.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Created {formatDate(product.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-lg font-bold text-foreground">
                        <DollarSign className="h-5 w-5 text-green-500" />
                        {formatCurrency(Number(product.price))}
                      </div>
                      <p className="text-xs text-muted-foreground">per month</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Packages Tab */}
      {activeTab === 'packages' && (
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Layers className="h-5 w-5 mr-2 text-muted-foreground" />
              <h4 className="text-sm font-semibold text-foreground">
                Subscription Packages ({packages.length})
              </h4>
            </div>
            <Button
              onClick={() => setShowCreatePackageModal(true)}
              size="sm"
              disabled={products.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Package
            </Button>
          </div>

          {packages.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Layers className="h-6 w-6 text-muted-foreground" />
              </div>
              <h4 className="text-base font-semibold text-foreground mb-2">
                No subscription packages yet
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                {products.length === 0
                  ? 'Create individual products first, then group them into packages.'
                  : 'Group your products into subscription packages to offer bundled deals.'}
              </p>
              <Button
                onClick={() =>
                  products.length === 0
                    ? setShowCreateModal(true)
                    : setShowCreatePackageModal(true)
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                {products.length === 0
                  ? 'Create Your First Product'
                  : 'Create Your First Package'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {packages.map(pkg => (
                <div
                  key={pkg.id}
                  className="bg-muted/30 border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h5 className="font-semibold text-foreground">
                          {pkg.name}
                        </h5>
                        <Badge variant="success">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                      {pkg.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {pkg.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-lg font-bold text-foreground">
                        <DollarSign className="h-5 w-5 text-green-500" />
                        {formatCurrency(pkg.totalPrice)}
                      </div>
                      <p className="text-xs text-muted-foreground">per month</p>
                    </div>
                  </div>

                  <div className="border-t border-border pt-3">
                    <p className="text-xs text-muted-foreground mb-2">
                      Included Products:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {pkg.products.map(product => (
                        <Badge
                          key={product.id}
                          variant="outline"
                          className="text-xs"
                        >
                          {product.name} - ${Number(product.price).toFixed(2)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Information Card */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">
              How Subscription Management Works
            </h4>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                • <strong>Products:</strong> Individual subscription items with
                monthly pricing
              </p>
              <p>
                • <strong>Packages:</strong> Bundle multiple products together
                for users to subscribe to
              </p>
              <p>
                • <strong>User Subscriptions:</strong> Users can subscribe to
                individual products or entire packages
              </p>
              <p>
                • <strong>Access Control:</strong> Active subscriptions grant
                access to your app&apos;s features
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Product Modal */}
      {showCreateModal && (
        <CreateProductModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateProduct}
        />
      )}

      {/* Create Package Modal */}
      {showCreatePackageModal && (
        <CreatePackageModal
          products={products}
          onClose={() => setShowCreatePackageModal(false)}
          onSubmit={handleCreatePackage}
        />
      )}
    </div>
  );
}
