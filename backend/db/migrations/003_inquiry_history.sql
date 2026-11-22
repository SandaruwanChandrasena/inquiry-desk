-- One row per action on an inquiry: who did what, and when
CREATE TABLE IF NOT EXISTS inquiry_history (
  id          SERIAL      PRIMARY KEY,
  inquiry_id  INTEGER     NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status   TEXT        NOT NULL,
  changed_by  INTEGER     NOT NULL REFERENCES users(id),
  changed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiry_history_inquiry_id ON inquiry_history (inquiry_id);

-- Inquiries that already exist get their "created" row (from_status NULL = created)
INSERT INTO inquiry_history (inquiry_id, from_status, to_status, changed_by, changed_at)
SELECT id, NULL, 'new', created_by, created_at
FROM inquiries;