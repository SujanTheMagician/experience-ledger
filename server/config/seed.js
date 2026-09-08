require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('./db');

// Inserts a couple of demo users + pending experiences so the Review Queue
// has real rows to approve/reject/delete against during local testing.
// Both demo accounts use the password "password123".
const seed = async () => {
  try {
    const passwordHash = await bcrypt.hash('password123', 10);

    const { rows: students } = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ('Alex Rivera', 'alex.rivera@example.com', $1, 'student')
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password = EXCLUDED.password
       RETURNING id`,
      [passwordHash]
    );
    const { rows: mentors } = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ('Dr. Sarah Jenkins', 'sarah.jenkins@example.com', $1, 'mentor')
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password = EXCLUDED.password
       RETURNING id`,
      [passwordHash]
    );

    const studentId = students[0].id;

    await pool.query(
      `INSERT INTO experiences (student_id, type, organization, role, duration, description, outcome, status)
       VALUES
        ($1, 'internship', 'Global Tech Corp', 'Data Science Intern', 'Jun 2023 - Aug 2023',
         'Led a team of 4 to refactor the data pipeline for the customer dashboard.',
         'Reduced processing latency by 40% using asynchronous tasks and optimized SQL queries.',
         'Pending Verification'),
        ($1, 'project', 'Creative Hub', 'Product Designer', 'Oct 2023 - Present',
         'Designed onboarding flows for the mobile app redesign.', NULL, 'Pending Verification')
       `,
      [studentId]
    );

    console.log(`Seeded demo data (student id ${studentId}, mentor id ${mentors[0].id})`);
  } catch (err) {
    console.error('Failed to seed demo data:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

seed();
