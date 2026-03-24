const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lab:       { type: mongoose.Schema.Types.ObjectId, ref: 'Lab',  required: true },
  labId:     { type: String, required: true },
  answers:   [{ questionIndex: Number, selectedIndex: Number, isCorrect: Boolean }],
  score:     { type: Number, required: true },
  totalQ:    { type: Number, required: true },
  correctQ:  { type: Number, required: true },
  timeSpent: { type: Number, default: 0 },
  passed:    { type: Boolean, default: false },
}, { timestamps: true });

quizAttemptSchema.index({ user: 1, labId: 1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
