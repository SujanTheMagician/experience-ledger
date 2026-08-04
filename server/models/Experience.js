const mongoose = require('mongoose');
const { Schema } = mongoose;

// Embedded, not a separate collection — comments only ever get read alongside their
// parent experience (mentor review queue, student's own entry view), so there's no
// query pattern that needs them independently.
const mentorCommentSchema = new Schema(
  {
    comment: { type: String, required: true },
    commentedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    commentedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const attachmentSchema = new Schema(
  {
    url: { type: String, required: true },
    fileType: { type: String }, // e.g. "pdf", "image", "link"
  },
  { _id: false }
);

const experienceSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['internship', 'project'],
      required: true,
    },
    organizationName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    description: {
      type: String,
      required: true,
    },
    skills: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Skill',
      },
    ],
    outcome: {
      type: String,
    },
    attachments: [attachmentSchema],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'changes_requested'],
      default: 'pending',
    },
    // Mentor assigned to review this specific entry (usually student.mentor, denormalized
    // here so reassignment doesn't rewrite history of who was reviewing what)
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    mentorComments: [mentorCommentSchema],
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Powers the student dashboard timeline (PRD §6.1) and mentor review queue (PRD §6.2)
experienceSchema.index({ student: 1, status: 1 });
// Powers mentor's bulk view filtered by status (PRD §6.2)
experienceSchema.index({ reviewedBy: 1, status: 1 });
// Powers analytics: skill-distribution charts filtered to verified entries (PRD §6.3)
experienceSchema.index({ skills: 1, status: 1 });

module.exports = mongoose.model('Experience', experienceSchema);
