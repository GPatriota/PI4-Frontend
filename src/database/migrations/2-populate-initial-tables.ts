import type { SQLiteDatabase } from 'expo-sqlite';

const migration: { name: string; up: (db: SQLiteDatabase) => void } = {
  name: '2-populate-initial-tables',
  up(db) {
    // Categories
    db.runSync(
      `INSERT INTO categories (name, icon) VALUES (?, ?)`,
      ['Celulares', 'phone-portrait-outline']
    );
    db.runSync(
      `INSERT INTO categories (name, icon) VALUES (?, ?)`,
      ['Computadores/Desktops', 'desktop-outline']
    );
    db.runSync(
      `INSERT INTO categories (name, icon) VALUES (?, ?)`,
      ['Notebooks', 'laptop-outline']
    );

    // Users (plain-text passwords for MVP)
    const u1 = db.runSync(
      `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
      ['Carlos Silva', 'carlos.silva@email.com', 'senha123']
    );
    const u2 = db.runSync(
      `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
      ['Ana Souza', 'ana.souza@email.com', 'senha123']
    );
    const u3 = db.runSync(
      `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
      ['Admin', 'admin@electroshop.com', 'admin123']
    );

    const ids = [u1.lastInsertRowId, u2.lastInsertRowId, u3.lastInsertRowId];

    // Addresses
    db.runSync(
      `INSERT INTO addresses (userId, label, street, city, state, zipCode, isDefault)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [ids[0], 'Residencial', 'Av. Paulista, 1578, Ap 42', 'São Paulo', 'SP', '01310-100', 1]
    );
    db.runSync(
      `INSERT INTO addresses (userId, label, street, city, state, zipCode, isDefault)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [ids[1], 'Residencial', 'Rua das Flores, 200', 'Rio de Janeiro', 'RJ', '20040-020', 1]
    );
    db.runSync(
      `INSERT INTO addresses (userId, label, street, city, state, zipCode, isDefault)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [ids[2], 'Comercial', 'Av. Brasil, 1000', 'Brasília', 'DF', '70040-010', 1]
    );

    // Accessibility settings (defaults)
    for (const uid of ids) {
      db.runSync(
        `INSERT INTO accessibilitySettings (userId, fontScale, highContrast, largeButtons)
         VALUES (?, ?, ?, ?)`,
        [uid, 1.0, 0, 0]
      );
    }
  },
};

export default migration;
