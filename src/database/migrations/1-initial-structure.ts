import type { SQLiteDatabase } from 'expo-sqlite';

const migration: { name: string; up: (db: SQLiteDatabase) => void } = {
  name: '1-initial-structure',
  up(db) {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS users (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        name        VARCHAR(100)  NOT NULL,
        email       VARCHAR(150)  NOT NULL UNIQUE,
        password    VARCHAR(255)  NOT NULL,
        createdAt   TEXT          NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS categories (
        id    INTEGER PRIMARY KEY AUTOINCREMENT,
        name  VARCHAR(50)  NOT NULL,
        icon  VARCHAR(100) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS products (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        categoryId    INTEGER       NOT NULL,
        name          VARCHAR(150)  NOT NULL,
        description   TEXT          NOT NULL DEFAULT '',
        price         REAL          NOT NULL,
        originalPrice REAL,
        stock         INTEGER       NOT NULL DEFAULT 0,
        imageUrl      VARCHAR(300),
        imageAlt      TEXT,
        rating        REAL,
        ratingCount   INTEGER,
        badge         VARCHAR(30),
        isActive      INTEGER       NOT NULL DEFAULT 1,
        createdAt     TEXT          NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (categoryId) REFERENCES categories(id)
      );

      CREATE TABLE IF NOT EXISTS cartItems (
        id        INTEGER PRIMARY KEY AUTOINCREMENT,
        userId    INTEGER NOT NULL,
        productId INTEGER NOT NULL,
        quantity  INTEGER NOT NULL DEFAULT 1,
        addedAt   TEXT    NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (userId)    REFERENCES users(id),
        FOREIGN KEY (productId) REFERENCES products(id)
      );

      CREATE TABLE IF NOT EXISTS orders (
        id        INTEGER PRIMARY KEY AUTOINCREMENT,
        userId    INTEGER NOT NULL,
        status    TEXT    NOT NULL DEFAULT 'pending'
                          CHECK(status IN ('pending','confirmed','cancelled')),
        subtotal  REAL    NOT NULL,
        shipping  REAL    NOT NULL DEFAULT 0,
        total     REAL    NOT NULL,
        createdAt TEXT    NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (userId) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS orderItems (
        id        INTEGER PRIMARY KEY AUTOINCREMENT,
        orderId   INTEGER NOT NULL,
        productId INTEGER NOT NULL,
        quantity  INTEGER NOT NULL,
        unitPrice REAL    NOT NULL,
        FOREIGN KEY (orderId)   REFERENCES orders(id),
        FOREIGN KEY (productId) REFERENCES products(id)
      );

      CREATE TABLE IF NOT EXISTS addresses (
        id        INTEGER PRIMARY KEY AUTOINCREMENT,
        userId    INTEGER      NOT NULL,
        label     VARCHAR(50)  NOT NULL,
        street    VARCHAR(200) NOT NULL,
        city      VARCHAR(100) NOT NULL,
        state     CHAR(2)      NOT NULL,
        zipCode   VARCHAR(10)  NOT NULL,
        isDefault INTEGER      NOT NULL DEFAULT 0,
        FOREIGN KEY (userId) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS accessibilitySettings (
        userId       INTEGER NOT NULL PRIMARY KEY,
        fontScale    REAL    NOT NULL DEFAULT 1.0,
        highContrast INTEGER NOT NULL DEFAULT 0,
        largeButtons INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (userId) REFERENCES users(id)
      );
    `);
  },
};

export default migration;
