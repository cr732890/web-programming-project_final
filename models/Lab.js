const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema({
  question:     { type: String, required: true },
  options:      [{ type: String, required: true }],
  correctIndex: { type: Number, required: true },
  explanation:  { type: String, default: '' },
});

const labSchema = new mongoose.Schema({
  labId:       { type: String, required: true, unique: true },
  title:       { type: String, required: true },
  subject:     { type: String, required: true, enum: ['physics','chemistry','biology','mathematics','computer-science'] },
  description: { type: String, default: '' },
  theory:      { type: String, default: '' },
  formula:     { type: String, default: '' },
  variables:   [{ symbol: String, description: String }],
  procedure:   [{ step: Number, text: String }],
  difficulty:  { type: String, enum: ['easy','medium','hard'], default: 'medium' },
  tags:        [String],
  isActive:    { type: Boolean, default: true },
  quizQuestions: [quizQuestionSchema],
  attemptCount:  { type: Number, default: 0 },
  avgScore:      { type: Number, default: 0 },
}, { timestamps: true });

labSchema.index({ subject: 1, isActive: 1 });

module.exports = mongoose.model('Lab', labSchema);
