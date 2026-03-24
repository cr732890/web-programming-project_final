const User          = require('../models/User');
const QuizAttempt   = require('../models/QuizAttempt');
const SimulationLog = require('../models/SimulationLog');

exports.getDashboard = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const [attempts, simCount] = await Promise.all([
      QuizAttempt.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10).populate('lab', 'title subject labId'),
      SimulationLog.countDocuments({ user: req.user._id }),
    ]);
    const bestScores = {};
    attempts.forEach(a => { if (!bestScores[a.labId] || a.score > bestScores[a.labId]) bestScores[a.labId] = a.score; });
    res.json({ success: true, dashboard: { user: user.toPublicJSON(), totalLabsCompleted: user.totalLabsCompleted, totalQuizScore: user.totalQuizScore, avgScore: user.totalLabsCompleted ? Math.round(user.totalQuizScore / user.totalLabsCompleted) : 0, simulationRuns: simCount, recentAttempts: attempts, bestScores } });
  } catch (err) { next(err); }
};

exports.getHistory = async (req, res, next) => {
  try {
    const page = Math.max(1, +req.query.page || 1), limit = Math.min(50, +req.query.limit || 20), skip = (page-1)*limit;
    const [attempts, total] = await Promise.all([QuizAttempt.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('lab','title subject'), QuizAttempt.countDocuments({ user: req.user._id })]);
    res.json({ success: true, page, totalPages: Math.ceil(total/limit), total, attempts });
  } catch (err) { next(err); }
};

exports.getLeaderboard = async (req, res, next) => {
  try {
    const top = await User.find({ role: 'student', isActive: true }).select('name schoolClass totalLabsCompleted totalQuizScore').sort({ totalQuizScore: -1, totalLabsCompleted: -1 }).limit(20);
    res.json({ success: true, leaderboard: top });
  } catch (err) { next(err); }
};

exports.getLabProgress = async (req, res, next) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.user._id, labId: req.params.labId }).sort({ createdAt: -1 });
    res.json({ success: true, attempts, bestScore: attempts.length ? Math.max(...attempts.map(a => a.score)) : null });
  } catch (err) { next(err); }
};
