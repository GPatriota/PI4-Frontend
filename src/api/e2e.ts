import type { Address, CartItemWithProduct, Category, Order, OrderWithItems, Product, User } from '../types';
import { apiRequest } from './client';

type AuthResponse = {
  user: {
    id: number;
    name: string;
    email: string;
    createdAt: string;
  };
  accessToken: string;
  refreshToken: string;
};

function normalizeProduct(product: Product & { isActive: boolean | number }): Product {
  return {
    ...product,
    isActive: Boolean(product.isActive),
  };
}

function toUser(input: AuthResponse['user']): User {
  return {
    id: input.id,
    name: input.name,
    email: input.email,
    password: '',
    createdAt: input.createdAt,
  };
}

export async function registerUser(name: string, email: string, password: string) {
  const result = await apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: { name, email, password },
  });

  return {
    user: toUser(result.user),
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  };
}

export async function loginUser(email: string, password: string) {
  const result = await apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });

  return {
    user: toUser(result.user),
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  };
}

export async function getCurrentUser(token: string): Promise<User> {
  const result = await apiRequest<{ user: AuthResponse['user'] }>('/auth/me', { token });
  return toUser(result.user);
}

export async function getCategories(): Promise<Category[]> {
  const result = await apiRequest<{ categories: Array<Category & { productCount?: number }> }>('/categories');
  return result.categories.map((category) => ({ id: category.id, name: category.name, icon: category.icon }));
}

export async function getProducts(params?: { category?: string; search?: string; active?: boolean; page?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.search) query.set('search', params.search);
  if (params?.active !== undefined) query.set('active', String(params.active));
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));

  const suffix = query.toString() ? `?${query.toString()}` : '';
  const result = await apiRequest<{ products: Product[] }>(`/products${suffix}`);
  return result.products.map((product) => normalizeProduct(product));
}

export async function getProductById(productId: number): Promise<Product> {
  const result = await apiRequest<{ product: Product }>(`/products/${productId}`);
  return normalizeProduct(result.product);
}

export async function getCart(token: string): Promise<{ items: CartItemWithProduct[]; totals: { subtotal: number; shipping: number; total: number } }> {
  const result = await apiRequest<{ items: CartItemWithProduct[]; totals: { subtotal: number; shipping: number; total: number } }>(
    '/cart',
    { token }
  );

  return {
    items: result.items.map((item) => ({
      ...item,
      product: normalizeProduct(item.product),
    })),
    totals: result.totals,
  };
}

export async function addCartItem(token: string, productId: number, quantity: number) {
  return apiRequest<{ cartItem: CartItemWithProduct }>('/cart/items', {
    method: 'POST',
    token,
    body: { productId, quantity },
  });
}

export async function updateCartItem(token: string, itemId: number, quantity: number) {
  return apiRequest<{ cartItem: CartItemWithProduct }>(`/cart/items/${itemId}`, {
    method: 'PATCH',
    token,
    body: { quantity },
  });
}

export async function removeCartItem(token: string, itemId: number) {
  await apiRequest(`/cart/items/${itemId}`, { method: 'DELETE', token });
}

export async function clearCart(token: string) {
  await apiRequest('/cart/clear', { method: 'DELETE', token });
}

export async function getOrders(token: string): Promise<Order[]> {
  const result = await apiRequest<{ orders: Order[] }>('/orders', { token });
  return result.orders.map((order) => ({ ...order, status: order.status.toLowerCase() as Order['status'] }));
}

export async function getOrderById(token: string, orderId: number): Promise<OrderWithItems> {
  const result = await apiRequest<{ order: OrderWithItems }>(`/orders/${orderId}`, { token });
  return {
    ...result.order,
    status: result.order.status.toLowerCase() as Order['status'],
    items: result.order.items.map((item) => ({
      ...item,
      product: normalizeProduct(item.product),
    })),
  };
}

export async function checkout(token: string) {
  return apiRequest<{ payment: { checkoutUrl: string; sandboxCheckoutUrl?: string } }>('/orders/checkout', {
    method: 'POST',
    token,
  });
}

export async function getAddresses(token: string): Promise<Address[]> {
  const result = await apiRequest<{ addresses: Address[] }>('/addresses', { token });
  return result.addresses.map((address) => ({ ...address, isDefault: Boolean(address.isDefault) }));
}
