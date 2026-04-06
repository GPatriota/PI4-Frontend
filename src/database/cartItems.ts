import { db } from './database';
import type { CartItem, CartItemWithProduct, Product } from '../types';

type CartItemRow = {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  addedAt: string;
};

type CartItemProductRow = CartItemRow & {
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

function rowToCartItemWithProduct(row: CartItemProductRow): CartItemWithProduct {
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
    id: row.id,
    userId: row.userId,
    productId: row.productId,
    quantity: row.quantity,
    addedAt: row.addedAt,
    product,
  };
}

export function findByUser(userId: number): CartItemWithProduct[] {
  const rows = db.getAllSync<CartItemProductRow>(
    `SELECT
       c.id, c.userId, c.productId, c.quantity, c.addedAt,
       p.id AS p_id, p.categoryId AS p_categoryId, p.name AS p_name,
       p.description AS p_description, p.price AS p_price,
       p.originalPrice AS p_originalPrice, p.stock AS p_stock,
       p.imageUrl AS p_imageUrl, p.imageAlt AS p_imageAlt,
       p.rating AS p_rating, p.ratingCount AS p_ratingCount,
       p.badge AS p_badge, p.isActive AS p_isActive, p.createdAt AS p_createdAt
     FROM cartItems c
     JOIN products p ON p.id = c.productId
     WHERE c.userId = ?
     ORDER BY c.addedAt DESC`,
    [userId]
  );
  return rows.map(rowToCartItemWithProduct);
}

export function add(userId: number, productId: number, quantity = 1): CartItem {
  const existing = db.getFirstSync<CartItemRow>(
    'SELECT * FROM cartItems WHERE userId = ? AND productId = ?',
    [userId, productId]
  );
  if (existing) {
    db.runSync(
      'UPDATE cartItems SET quantity = quantity + ? WHERE id = ?',
      [quantity, existing.id]
    );
    return db.getFirstSync<CartItemRow>('SELECT * FROM cartItems WHERE id = ?', [existing.id])!;
  }
  const result = db.runSync(
    'INSERT INTO cartItems (userId, productId, quantity) VALUES (?, ?, ?)',
    [userId, productId, quantity]
  );
  return db.getFirstSync<CartItemRow>(
    'SELECT * FROM cartItems WHERE id = ?',
    [result.lastInsertRowId]
  )!;
}

export function updateQuantity(id: number, quantity: number): void {
  db.runSync('UPDATE cartItems SET quantity = ? WHERE id = ?', [quantity, id]);
}

export function remove(id: number): void {
  db.runSync('DELETE FROM cartItems WHERE id = ?', [id]);
}

export function clear(userId: number): void {
  db.runSync('DELETE FROM cartItems WHERE userId = ?', [userId]);
}
