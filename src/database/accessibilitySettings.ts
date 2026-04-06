import { db } from './database';
import type { AccessibilitySettings } from '../types';

type AccessibilityRow = {
  userId: number;
  fontScale: number;
  highContrast: number;
  largeButtons: number;
};

function toSettings(row: AccessibilityRow): AccessibilitySettings {
  return {
    userId: row.userId,
    fontScale: row.fontScale,
    highContrast: row.highContrast === 1,
    largeButtons: row.largeButtons === 1,
  };
}

export function get(userId: number): AccessibilitySettings | null {
  const row = db.getFirstSync<AccessibilityRow>(
    'SELECT * FROM accessibilitySettings WHERE userId = ?',
    [userId]
  );
  return row ? toSettings(row) : null;
}

export function upsert(
  userId: number,
  settings: Partial<Omit<AccessibilitySettings, 'userId'>>
): void {
  const existing = get(userId);
  if (existing) {
    const fields: string[] = [];
    const values: (number | null)[] = [];
    if (settings.fontScale !== undefined) { fields.push('fontScale = ?'); values.push(settings.fontScale); }
    if (settings.highContrast !== undefined) { fields.push('highContrast = ?'); values.push(settings.highContrast ? 1 : 0); }
    if (settings.largeButtons !== undefined) { fields.push('largeButtons = ?'); values.push(settings.largeButtons ? 1 : 0); }
    if (fields.length === 0) return;
    values.push(userId);
    db.runSync(`UPDATE accessibilitySettings SET ${fields.join(', ')} WHERE userId = ?`, values);
  } else {
    db.runSync(
      `INSERT INTO accessibilitySettings (userId, fontScale, highContrast, largeButtons)
       VALUES (?, ?, ?, ?)`,
      [
        userId,
        settings.fontScale ?? 1.0,
        settings.highContrast ? 1 : 0,
        settings.largeButtons ? 1 : 0,
      ]
    );
  }
}
