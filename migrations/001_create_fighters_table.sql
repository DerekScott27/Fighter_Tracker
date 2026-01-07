CREATE TABLE IF NOT EXISTS attributes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);






CREATE TABLE IF NOT EXISTS fighters (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  discipline TEXT NOT NULL,
  record TEXT NOT NULL,
  analysis TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS fighter_attributes (
  fighters_id INTEGER REFERENCES fighters(id),
  attributes_id INTEGER REFERENCES attributes(id),
  PRIMARY KEY (fighters_id, attributes_id)
);