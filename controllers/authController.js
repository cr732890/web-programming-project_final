const jwt  = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const signToken = id => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const { name, email, password, schoolClass } = req.body;
    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    const user = await User.create({ name, email, password, schoolClass });
    const token = signToken(user._id);
    res.status(201).json({ success: true, token, user: user.toPublicJSON() });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account deactivated.' });
    res.json({ success: true, token: signToken(user._id), user: user.toPublicJSON() });
  } catch (err) { next(err); }
};

exports.getMe = async (req, res, next) => {
  try { res.json({ success: true, user: (await User.findById(req.user._id)).toPublicJSON() }); }
  catch (err) { next(err); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { name: req.body.name, schoolClass: req.body.schoolClass }, { new: true, runValidators: true });
    res.json({ success: true, user: user.toPublicJSON() });
  } catch (err) { next(err); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) return res.status(400).json({ success: false, message: 'New password must be ≥8 chars.' });
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) return res.status(401).json({ success: false, message: 'Current password incorrect.' });
    user.password = newPassword; await user.save();
    res.json({ success: true, message: 'Password changed.' });
  } catch (err) { next(err); }
};

exports.logout = (req, res) => res.json({ success: true, message: 'Signed out. Delete token on client.' });
