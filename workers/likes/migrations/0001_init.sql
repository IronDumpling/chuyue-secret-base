CREATE TABLE IF NOT EXISTS likes (
  id TEXT PRIMARY KEY,
  n INTEGER NOT NULL DEFAULT 0
);

-- Who liked what recently, keyed by a salted IP hash; rows older than a day are pruned.
CREATE TABLE IF NOT EXISTS votes (
  id TEXT NOT NULL,
  voter TEXT NOT NULL,
  at INTEGER NOT NULL,
  PRIMARY KEY (id, voter)
);
CREATE INDEX IF NOT EXISTS votes_at ON votes (at);
