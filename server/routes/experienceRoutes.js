const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  createExperience,
  getExperiences,
  getExperienceById,
  updateExperienceStatus,
  deleteExperience,
} = require("../controllers/experienceController");

// POST /api/experiences        -> create new experience under the logged-in user (DB write, requires login)
// GET  /api/experiences        -> list experiences, optional ?student=&status= (DB read)
router.route("/").post(protect, createExperience).get(getExperiences);

// GET /api/experiences/:id     -> single experience (DB read)
// DELETE /api/experiences/:id  -> remove experience (DB write, requires login; owner or a reviewer)
router.route("/:id").get(getExperienceById).delete(protect, deleteExperience);

// PUT /api/experiences/:id/status -> mentor/placement officer/admin approve/reject/comment
router.put("/:id/status", protect, authorize("mentor", "placement_officer", "admin"), updateExperienceStatus);

module.exports = router;
