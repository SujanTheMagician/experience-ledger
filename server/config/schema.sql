-- Experience Ledger schema (PostgreSQL)

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'student'
    CHECK (role IN ('student', 'mentor', 'placement_officer', 'admin')),
  department VARCHAR(255),
  batch VARCHAR(50),
  mentor_id INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_mentor_id ON users(mentor_id);
CREATE INDEX IF NOT EXISTS idx_users_department_batch ON users(department, batch);

CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  category VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS experiences (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES users(id),
  type VARCHAR(50) NOT NULL CHECK (type IN ('internship', 'project')),
  organization VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  duration VARCHAR(255),
  description TEXT NOT NULL,
  outcome TEXT,
  evidence_link TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'Pending Verification'
    CHECK (status IN ('Pending Verification', 'Approved', 'Rejected', 'Changes Requested')),
  mentor_comment TEXT,
  reviewed_by INTEGER REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_experiences_student_status ON experiences(student_id, status);
CREATE INDEX IF NOT EXISTS idx_experiences_reviewed_by_status ON experiences(reviewed_by, status);

CREATE TABLE IF NOT EXISTS experience_skills (
  experience_id INTEGER NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (experience_id, skill_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  message TEXT NOT NULL,
  related_experience_id INTEGER REFERENCES experiences(id),
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_is_read ON notifications(user_id, is_read);
