import { db } from './database';
import type { Category } from '../types';

export function findAll(): Category[] {
  return db.getAllSync<Category>('SELECT * FROM categories ORDER BY name');
}

export function findById(id: number): Category | null {
  return db.getFirstSync<Category>('SELECT * FROM categories WHERE id = ?', [id]) ?? null;
}
