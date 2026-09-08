const { pool } = require("../config/db");

// @desc   Create a new experience entry (DB WRITE)
// @route  POST /api/experiences
const createExperience = async (req, res) => {
  try {
    const {
      type,
      organization,
      role,
      duration,
      description,
      outcome,
      evidenceLink,
    } = req.body;

    if (!type || !organization || !role) {
      return res.status(400).json({
        success: false,
        message: "type, organization, and role are required fields",
      });
    }

    // The owner is always the authenticated user from the JWT, never a client-supplied
    // id — otherwise any logged-in user could submit an experience under someone else's account.
    const studentId = req.user.id;

    const { rows } = await pool.query(
      `INSERT INTO experiences
        (student_id, type, organization, role, duration, description, outcome, evidence_link, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Pending Verification')
       RETURNING *`,
      [studentId, type, organization, role, duration, description, outcome, evidenceLink]
    );

    return res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Error creating experience:", error.message);
    return res.status(500).json({ success: false, message: "Server error while creating experience" });
  }
};

// @desc   Get all experiences, optional filtering by student/status (DB READ)
// @route  GET /api/experiences
const getExperiences = async (req, res) => {
  try {
    const { student, status } = req.query;
    const conditions = [];
    const values = [];

    if (student) {
      values.push(student);
      conditions.push(`e.student_id = $${values.length}`);
    }
    if (status) {
      values.push(status);
      conditions.push(`e.status = $${values.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const { rows } = await pool.query(
      `SELECT e.*, u.name AS student_name, u.email AS student_email, u.role AS student_role
       FROM experiences e
       JOIN users u ON u.id = e.student_id
       ${whereClause}
       ORDER BY e.created_at DESC`,
      values
    );

    return res.status(200).json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error("Error fetching experiences:", error.message);
    return res.status(500).json({ success: false, message: "Server error while fetching experiences" });
  }
};

// @desc   Get a single experience by id (DB READ)
// @route  GET /api/experiences/:id
const getExperienceById = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT e.*, u.name AS student_name, u.email AS student_email, u.role AS student_role
       FROM experiences e
       JOIN users u ON u.id = e.student_id
       WHERE e.id = $1`,
      [req.params.id]
    );

    if (!rows[0]) {
      return res.status(404).json({ success: false, message: "Experience not found" });
    }

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Error fetching experience:", error.message);
    return res.status(500).json({ success: false, message: "Server error while fetching experience" });
  }
};

// @desc   Update verification status of an experience, e.g. mentor approve/reject (DB WRITE)
// @route  PUT /api/experiences/:id/status
const updateExperienceStatus = async (req, res) => {
  try {
    const { status, mentorComment } = req.body;
    const allowedStatuses = ["Pending Verification", "Approved", "Rejected", "Changes Requested"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${allowedStatuses.join(", ")}`,
      });
    }

    const { rows } = await pool.query(
      `UPDATE experiences
       SET status = $1, mentor_comment = $2, updated_at = now()
       WHERE id = $3
       RETURNING *`,
      [status, mentorComment, req.params.id]
    );

    if (!rows[0]) {
      return res.status(404).json({ success: false, message: "Experience not found" });
    }

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Error updating experience status:", error.message);
    return res.status(500).json({ success: false, message: "Server error while updating experience" });
  }
};

// @desc   Delete an experience entry (DB WRITE) — reviewers can delete any entry,
//         a student can only delete their own
// @route  DELETE /api/experiences/:id
const deleteExperience = async (req, res) => {
  try {
    const { rows: existing } = await pool.query(`SELECT student_id FROM experiences WHERE id = $1`, [req.params.id]);

    if (!existing[0]) {
      return res.status(404).json({ success: false, message: "Experience not found" });
    }

    const isReviewer = ["mentor", "placement_officer", "admin"].includes(req.user.role);
    const isOwner = existing[0].student_id === req.user.id;

    if (!isReviewer && !isOwner) {
      return res.status(403).json({ success: false, message: "You can only delete your own experiences" });
    }

    const { rows } = await pool.query(`DELETE FROM experiences WHERE id = $1 RETURNING id`, [req.params.id]);

    if (!rows[0]) {
      return res.status(404).json({ success: false, message: "Experience not found" });
    }

    return res.status(200).json({ success: true, message: "Experience deleted successfully" });
  } catch (error) {
    console.error("Error deleting experience:", error.message);
    return res.status(500).json({ success: false, message: "Server error while deleting experience" });
  }
};

module.exports = {
  createExperience,
  getExperiences,
  getExperienceById,
  updateExperienceStatus,
  deleteExperience,
};
