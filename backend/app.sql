
-- CREATE TABLE IF NOT EXISTS users (
-- id INTEGER PRIMARY KEY AUTOINCREMENT,
-- username TEXT NOT NULL UNIQUE,
-- password TEXT NOT NULL,
-- role TEXT NOT NULL DEFAULT 'user',
-- createdAt TEXT DEFAULT (datetime('now'))
-- );



-- CREATE TABLE IF NOT EXISTS tasks (
-- id INTEGER PRIMARY KEY AUTOINCREMENT,
-- title TEXT NOT NULL,
-- description TEXT,
-- status TEXT NOT NULL DEFAULT 'pending',
-- createdBy INTEGER NOT NULL,
-- createdAt TEXT DEFAULT (datetime('now')),
-- FOREIGN KEY(createdBy) REFERENCES users(id)
-- );

