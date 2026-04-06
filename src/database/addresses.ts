import { db } from './database';
import type { Address } from '../types';

type AddressRow = {
  id: number;
  userId: number;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: number;
};

function toAddress(row: AddressRow): Address {
  return { ...row, isDefault: row.isDefault === 1 };
}

export function findByUser(userId: number): Address[] {
  return db
    .getAllSync<AddressRow>(
      'SELECT * FROM addresses WHERE userId = ? ORDER BY isDefault DESC, id ASC',
      [userId]
    )
    .map(toAddress);
}

export type CreateAddressData = {
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault?: boolean;
};

export function create(userId: number, data: CreateAddressData): Address {
  if (data.isDefault) {
    db.runSync(
      'UPDATE addresses SET isDefault = 0 WHERE userId = ?',
      [userId]
    );
  }
  const result = db.runSync(
    `INSERT INTO addresses (userId, label, street, city, state, zipCode, isDefault)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, data.label, data.street, data.city, data.state, data.zipCode, data.isDefault ? 1 : 0]
  );
  return toAddress(
    db.getFirstSync<AddressRow>('SELECT * FROM addresses WHERE id = ?', [result.lastInsertRowId])!
  );
}

export function setDefault(id: number, userId: number): void {
  db.runSync('UPDATE addresses SET isDefault = 0 WHERE userId = ?', [userId]);
  db.runSync('UPDATE addresses SET isDefault = 1 WHERE id = ?', [id]);
}
