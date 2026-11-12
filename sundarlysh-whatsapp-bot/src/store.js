// SQLite storage (Node's built-in node:sqlite, no dependencies).
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export function openStore(path = ':memory:') {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS sessions (
      wa_id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ref TEXT UNIQUE, wa_id TEXT NOT NULL, name TEXT, service_id TEXT, service_title TEXT,
      event_date TEXT, time_slot TEXT, city TEXT, guests TEXT, venue TEXT, notes TEXT,
      status TEXT NOT NULL DEFAULT 'pending', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS processed (msg_id TEXT PRIMARY KEY, at INTEGER NOT NULL);
  `);

  const q = {
    getSession: db.prepare('SELECT data, updated_at FROM sessions WHERE wa_id = ?'),
    putSession: db.prepare(`INSERT INTO sessions (wa_id, data, updated_at) VALUES (?, ?, ?)
      ON CONFLICT(wa_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`),
    insertBooking: db.prepare(`INSERT INTO bookings (wa_id, name, service_id, service_title, event_date, time_slot,
      city, guests, venue, notes, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`),
    setRef: db.prepare('UPDATE bookings SET ref = ? WHERE id = ?'),
    byRef: db.prepare('SELECT * FROM bookings WHERE ref = ? COLLATE NOCASE'),
    setStatus: db.prepare('UPDATE bookings SET status = ?, updated_at = ? WHERE ref = ? COLLATE NOCASE'),
    recent: db.prepare('SELECT * FROM bookings ORDER BY id DESC LIMIT ?'),
    all: db.prepare('SELECT * FROM bookings ORDER BY id DESC'),
    byCustomer: db.prepare('SELECT * FROM bookings WHERE wa_id = ? ORDER BY id DESC LIMIT ?'),
    seen: db.prepare('INSERT OR IGNORE INTO processed (msg_id, at) VALUES (?, ?)'),
    prune: db.prepare('DELETE FROM processed WHERE at < ?'),
  };

  return {
    db,
    getSession(waId) {
      const r = q.getSession.get(waId);
      return r ? { ...JSON.parse(r.data), _updatedAt: r.updated_at } : null;
    },
    saveSession(waId, session, now = Date.now()) {
      const { _updatedAt, ...data } = session;
      q.putSession.run(waId, JSON.stringify(data), now);
    },
    createBooking(b, now = Date.now()) {
      const r = q.insertBooking.run(b.waId, b.name, b.serviceId, b.serviceTitle, b.date, b.timeSlot,
        b.city, b.guests, b.venue || '', b.notes || '', now, now);
      const ref = `SL-${1000 + Number(r.lastInsertRowid)}`;
      q.setRef.run(ref, r.lastInsertRowid);
      return q.byRef.get(ref);
    },
    getBooking: (ref) => q.byRef.get(ref) || null,
    setStatus(ref, status, now = Date.now()) {
      return q.setStatus.run(status, now, ref).changes > 0 ? q.byRef.get(ref) : null;
    },
    recentBookings: (n = 10) => q.recent.all(n),
    allBookings: () => q.all.all(),
    customerBookings: (waId, n = 5) => q.byCustomer.all(waId, n),
    // true the first time a message id is seen (WhatsApp may deliver a webhook more than once)
    markProcessed(msgId, now = Date.now()) {
      q.prune.run(now - 3 * 24 * 3600e3);
      return q.seen.run(msgId, now).changes > 0;
    },
  };
}
