const mongoose = require('mongoose');
const { Schema } = mongoose;

const skillSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String, // e.g. "Programming Language", "Framework", "Soft Skill"
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Skill', skillSchema);
