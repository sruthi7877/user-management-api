-- managers table


CREATE TABLE IF NOT EXISTS managers(
    manager_id TEXT PRIMARY KEY,
    is_active INTEGER DEFAULT 1
);

INSERT OR IGNORE INTO managers(manager_id,is_active) VALUES
('550e8400-e29b-41d4-a716-446655440000', 1),
('550e8400-e29b-41d4-a716-446655440001', 1);

--users tablE

CREATE TABLE IF NOT EXISTS users(
    user_id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    mob_num TEXT NOT NULL,
    pan_num TEXT NOT NULL,
    manager_id TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY (manager_id) REFERENCES managers(manager_id)
);


