import { db } from './database';
import { clear as clearCart } from './cartItems';
import type { Order, OrderWithItems, Product } from '../types';

type OrderRow = {
  id: number;
  userId: number;
  status: string;
  subtotal: number;
  shipping: number;
  total: number;
  createdAt: string;
};

type OrderItemProductRow = {
  oi_id: number;
  oi_orderId: number;
  oi_productId: number;
  oi_quantity: number;
  oi_unitPrice: number;
  p_id: number;
  p_categoryId: number;
  p_name: string;
  p_description: string;
  p_price: number;
  p_originalPrice: number | null;
  p_stock: number;
  p_imageUrl: string | null;
  p_imageAlt: string | null;
  p_rating: number | null;
  p_ratingCount: number | null;
  p_badge: string | null;
  p_isActive: number;
  p_createdAt: string;
};

function toOrder(row: OrderRow): Order {
  return {
    ...row,
    status: row.status as Order['status'],
  };
}

export function findByUser(userId: number): Order[] {
  return db
    .getAllSync<OrderRow>(
      'SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    )
    .map(toOrder);
}

export function findById(id: number): OrderWithItems | null {
  const orderRow = db.getFirstSync<OrderRow>('SELECT * FROM orders WHERE id = ?', [id]);
  if (!orderRow) return null;

  const itemRows = db.getAllSync<OrderItemProductRow>(
    `SELECT
       oi.id AS oi_id, oi.orderId AS oi_orderId, oi.productId AS oi_productId,
       oi.quantity AS oi_quantity, oi.unitPrice AS oi_unitPrice,
       p.id AS p_id, p.categoryId AS p_categoryId, p.name AS p_name,
       p.description AS p_description, p.price AS p_price,
       p.originalPrice AS p_originalPrice, p.stock AS p_stock,
       p.imageUrl AS p_imageUrl, p.imageAlt AS p_imageAlt,
       p.rating AS p_rating, p.ratingCount AS p_ratingCount,
       p.badge AS p_badge, p.isActive AS p_isActive, p.createdAt AS p_createdAt
     FROM orderItems oi
     JOIN products p ON p.id = oi.productId
     WHERE oi.orderId = ?`,
    [id]
  );

  const items = itemRows.map((row) => {
    const product: Product = {
      id: row.p_id,
      categoryId: row.p_categoryId,
      name: row.p_name,
      description: row.p_description,
      price: row.p_price,
      originalPrice: row.p_originalPrice,
      stock: row.p_stock,
      imageUrl: row.p_imageUrl,
      imageAlt: row.p_imageAlt,
      rating: row.p_rating,
      ratingCount: row.p_ratingCount,
      badge: row.p_badge,
      isActive: row.p_isActive === 1,
      createdAt: row.p_createdAt,
    };
    return {
      id: row.oi_id,
      orderId: row.oi_orderId,
      productId: row.oi_productId,
      quantity: row.oi_quantity,
      unitPrice: row.oi_unitPrice,
      product,
    };
  });

  return { ...toOrder(orderRow), items };
}

export type OrderItemInput = {
  productId: number;
  quantity: number;
  unitPrice: number;
};

export function create(
  userId: number,
  items: OrderItemInput[],
  shipping: number
): Order {
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const total = subtotal + shipping;

  const result = db.runSync(
    `INSERT INTO orders (userId, status, subtotal, shipping, total)
     VALUES (?, 'confirmed', ?, ?, ?)`,
    [userId, subtotal, shipping, total]
  );
  const orderId = result.lastInsertRowId as number;

  for (const item of items) {
    db.runSync(
      'INSERT INTO orderItems (orderId, productId, quantity, unitPrice) VALUES (?, ?, ?, ?)',
      [orderId, item.productId, item.quantity, item.unitPrice]
    );
  }

  clearCart(userId);

  return findById(orderId) as Order;
}
