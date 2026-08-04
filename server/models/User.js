const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true, // store as a bcrypt hash, never plaintext
    },
    role: {
      type: String,
      enum: ['student', 'mentor', 'placement_officer', 'admin'],
      required: true,
      default: 'student',
    },
    department: {
      type: String,
      trim: true,
    },
    // Only meaningful when role === 'student'
    batch: {
      type: String, // e.g. "2023-2027"
      trim: true,
    },
    // Only meaningful when role === 'student' — the mentor assigned to verify their entries
    mentor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// Speeds up "get all students for this mentor" queries used in the mentor review queue (PRD §6.2)
userSchema.index({ mentor: 1 });
// Speeds up department/batch filtering used in the analytics dashboard (PRD §6.3)
userSchema.index({ department: 1, batch: 1 });

module.exports = mongoose.model('User', userSchema);
