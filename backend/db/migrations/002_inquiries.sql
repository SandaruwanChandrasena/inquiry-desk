CREATE TABLE IF NOT EXISTS inquiries (
  id            SERIAL      PRIMARY KEY,
  customer_name TEXT        NOT NULL,
  email         TEXT,
  phone         TEXT,
  subject       TEXT        NOT NULL,
  description   TEXT        NOT NULL,
  status        TEXT        NOT NULL DEFAULT 'new'
                CHECK (status IN ('new', 'in_progress', 'resolved')),
  version       INTEGER     NOT NULL DEFAULT 1,
  created_by    INTEGER     NOT NULL REFERENCES users(id),
  updated_by    INTEGER     NOT NULL REFERENCES users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT contact_required CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_inquiries_created_by ON inquiries (created_by);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries (status);