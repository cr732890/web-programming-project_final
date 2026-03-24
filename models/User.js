const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email:       { type: String, required: true, unique: true, lowercase: true, match: /^\S+@\S+\.\S+$/ },
  password:    { type: String, required: true, minlength: 8, select: false },
  schoolClass: { type: String, trim: true, default: '' },
  role:        { type: String, enum: ['student','teacher','admin'], default: 'student' },
  isActive:    { type: Boolean, default: true },
  labsCompleted: [{ labId: String, completedAt: { type: Date, default: Date.now }, score: Number, timeSpent: { type: Number, default: 0 } }],
  totalLabsCompleted: { type: Number, default: 0 },
  totalQuizScore:     { type: Number, default: 0 },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toPublicJSON = function() {
  return { _id: this._id, name: this.name, email: this.email, schoolClass: this.schoolClass, role: this.role, totalLabsCompleted: this.totalLabsCompleted, totalQuizScore: this.totalQuizScore, createdAt: this.createdAt };
};

module.exports = mongoose.model('User', userSchema);
