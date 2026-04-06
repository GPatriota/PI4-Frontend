import { db } from './database';
import type { Product } from '../types';

type ProductRow = {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  price: number;
  originalPrice: number | null;
  stock: number;
  imageUrl: string | null;
  imageAlt: string | null;
  rating: number | null;
  ratingCount: number | null;
  badge: string | null;
  isActive: number;
  createdAt: string;
};

function toProduct(row: ProductRow): Product {
  return { ...row, isActive: row.isActive === 1 };
}

export function findAll(activeOnly = true): Product[] {
  const query = activeOnly
    ? 'SELECT * FROM products WHERE isActive = 1 ORDER BY createdAt DESC'
    : 'SELECT * FROM products ORDER BY createdAt DESC';
  return db.getAllSync<ProductRow>(query).map(toProduct);
}

export function findById(id: number): Product | null {
  const row = db.getFirstSync<ProductRow>('SELECT * FROM products WHERE id = ?', [id]);
  return row ? toProduct(row) : null;
}

export function findByCategory(categoryId: number): Product[] {
  return db
    .getAllSync<ProductRow>(
      'SELECT * FROM products WHERE categoryId = ? AND isActive = 1 ORDER BY createdAt DESC',
      [categoryId]
    )
    .map(toProduct);
}

export function search(query: string): Product[] {
  const like = `%${query}%`;
  return db
    .getAllSync<ProductRow>(
      `SELECT * FROM products
       WHERE isActive = 1
         AND (name LIKE ? OR description LIKE ?)
       ORDER BY name`,
      [like, like]
    )
    .map(toProduct);
}

export type CreateProductData = {
  categoryId: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  stock: number;
  imageUrl?: string | null;
  imageAlt?: string | null;
  rating?: number | null;
  ratingCount?: number | null;
  badge?: string | null;
  isActive?: boolean;
};

export function create(data: CreateProductData): Product {
  const result = db.runSync(
    `INSERT INTO products
       (categoryId, name, description, price, originalPrice, stock,
        imageUrl, imageAlt, rating, ratingCount, badge, isActive)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.categoryId,
      data.name,
      data.description,
      data.price,
      data.originalPrice ?? null,
      data.stock,
      data.imageUrl ?? null,
      data.imageAlt ?? null,
      data.rating ?? null,
      data.ratingCount ?? null,
      data.badge ?? null,
      data.isActive === false ? 0 : 1,
    ]
  );
  const product = findById(result.lastInsertRowId as number);
  if (!product) throw new Error('Failed to create product');
  return product;
}

export function update(id: number, data: Partial<CreateProductData>): void {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.categoryId !== undefined) { fields.push('categoryId = ?'); values.push(data.categoryId); }
  if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
  if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
  if (data.price !== undefined) { fields.push('price = ?'); values.push(data.price); }
  if ('originalPrice' in data) { fields.push('originalPrice = ?'); values.push(data.originalPrice ?? null); }
  if (data.stock !== undefined) { fields.push('stock = ?'); values.push(data.stock); }
  if ('imageUrl' in data) { fields.push('imageUrl = ?'); values.push(data.imageUrl ?? null); }
  if ('imageAlt' in data) { fields.push('imageAlt = ?'); values.push(data.imageAlt ?? null); }
  if ('rating' in data) { fields.push('rating = ?'); values.push(data.rating ?? null); }
  if ('ratingCount' in data) { fields.push('ratingCount = ?'); values.push(data.ratingCount ?? null); }
  if ('badge' in data) { fields.push('badge = ?'); values.push(data.badge ?? null); }
  if (data.isActive !== undefined) { fields.push('isActive = ?'); values.push(data.isActive ? 1 : 0); }

  if (fields.length === 0) return;
  values.push(id);
  db.runSync(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, values);
}

export function remove(id: number): void {
  db.runSync('DELETE FROM products WHERE id = ?', [id]);
}
