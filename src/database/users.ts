import { db } from './database';
import type { User } from '../types';

type UserRow = {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: string;
};

function toUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    createdAt: row.createdAt,
  };
}

export function findAll(): User[] {
  const rows = db.getAllSync<UserRow>('SELECT * FROM users ORDER BY name');
  return rows.map(toUser);
}

export function findById(id: number): User | null {
  const row = db.getFirstSync<UserRow>('SELECT * FROM users WHERE id = ?', [id]);
  return row ? toUser(row) : null;
}

export function findByEmail(email: string): User | null {
  const row = db.getFirstSync<UserRow>(
    'SELECT * FROM users WHERE email = ? COLLATE NOCASE',
    [email]
  );
  return row ? toUser(row) : null;
}

export function create(data: { name: string; email: string; password: string }): User {
  const result = db.runSync(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [data.name, data.email, data.password]
  );
  const user = findById(result.lastInsertRowId as number);
  if (!user) throw new Error('Failed to create user');
  return user;
}

export function login(email: string, password: string): User | null {
  const user = findByEmail(email);
  if (!user) return null;
  if (user.password !== password) return null;
  return user;
}
