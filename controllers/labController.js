const Lab           = require('../models/Lab');
const QuizAttempt   = require('../models/QuizAttempt');
const SimulationLog = require('../models/SimulationLog');
const User          = require('../models/User');

exports.getAllLabs = async (req, res, next) => {
  try {
    const filter = { isActive: true };
    if (req.query.subject) filter.subject = req.query.subject;
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;
    const labs = await Lab.find(filter).select('-quizQuestions -theory -procedure').sort({ subject: 1, title: 1 });
    res.json({ success: true, count: labs.length, labs });
  } catch (err) { next(err); }
};

exports.getLabById = async (req, res, next) => {
  try {
    const lab = await Lab.findOne({ labId: req.params.labId, isActive: true });
    if (!lab) return res.status(404).json({ success: false, message: 'Lab not found.' });
    const labObj = lab.toObject();
    labObj.quizQuestions = labObj.quizQuestions.map(({ correctIndex, ...rest }) => rest);
    res.json({ success: true, lab: labObj });
  } catch (err) { next(err); }
};

exports.getSubjectSummary = async (req, res, next) => {
  try {
    const summary = await Lab.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$subject', count: { $sum: 1 }, avgScore: { $avg: '$avgScore' } } },
      { $sort: { _id: 1 } },
    ]);
    res.json({ success: true, summary });
  } catch (err) { next(err); }
};

exports.submitQuiz = async (req, res, next) => {
  try {
    const { answers, timeSpent } = req.body;
    const lab = await Lab.findOne({ labId: req.params.labId, isActive: true });
    if (!lab) return res.status(404).json({ success: false, message: 'Lab not found.' });
    if (!Array.isArray(answers) || answers.length === 0)
      return res.status(400).json({ success: false, message: 'Answers array required.' });
    const graded = answers.map(a => {
      const q = lab.quizQuestions[a.questionIndex];
      return { questionIndex: a.questionIndex, selectedIndex: a.selectedIndex, isCorrect: q ? a.selectedIndex === q.correctIndex : false };
    });
    const correctQ = graded.filter(g => g.isCorrect).length;
    const totalQ = lab.quizQuestions.length;
    const score = Math.round(correctQ / totalQ * 100);
    const passed = score >= 60;
    const attempt = await QuizAttempt.create({ user: req.user._id, lab: lab._id, labId: lab.labId, answers: graded, score, totalQ, correctQ, timeSpent: timeSpent || 0, passed });
    const allAttempts = await QuizAttempt.find({ labId: lab.labId });
    lab.attemptCount = allAttempts.length;
    lab.avgScore = Math.round(allAttempts.reduce((s, a) => s + a.score, 0) / allAttempts.length);
    await lab.save();
    const alreadyDone = req.user.labsCompleted?.find(l => l.labId === lab.labId);
    if (!alreadyDone) {
      await User.findByIdAndUpdate(req.user._id, { $push: { labsCompleted: { labId: lab.labId, score, timeSpent: timeSpent || 0 } }, $inc: { totalLabsCompleted: 1, totalQuizScore: score } });
    }
    const detailed = graded.map(g => ({ ...g, correctIndex: lab.quizQuestions[g.questionIndex]?.correctIndex, explanation: lab.quizQuestions[g.questionIndex]?.explanation || '' }));
    res.json({ success: true, score, passed, correctQ, totalQ, detailed, attemptId: attempt._id });
  } catch (err) { next(err); }
};

exports.logSimulation = async (req, res, next) => {
  try {
    const { inputs, result, sessionId } = req.body;
    await SimulationLog.create({ user: req.user?._id || null, labId: req.params.labId, inputs: inputs || {}, result: result || {}, sessionId: sessionId || '' });
    res.json({ success: true, message: 'Simulation logged.' });
  } catch (err) { next(err); }
};

exports.getLabStats = async (req, res, next) => {
  try {
    const lab = await Lab.findOne({ labId: req.params.labId });
    if (!lab) return res.status(404).json({ success: false, message: 'Lab not found.' });
    const [attempts, simCount] = await Promise.all([QuizAttempt.find({ labId: req.params.labId }).select('score passed'), SimulationLog.countDocuments({ labId: req.params.labId })]);
    const passRate = attempts.length ? Math.round(attempts.filter(a => a.passed).length / attempts.length * 100) : 0;
    res.json({ success: true, stats: { attemptCount: attempts.length, avgScore: lab.avgScore, passRate, simulationRuns: simCount } });
  } catch (err) { next(err); }
};

exports.createLab = async (req, res, next) => { try { res.status(201).json({ success: true, lab: await Lab.create(req.body) }); } catch (err) { next(err); } };
exports.updateLab = async (req, res, next) => { try { const lab = await Lab.findOneAndUpdate({ labId: req.params.labId }, req.body, { new: true, runValidators: true }); if (!lab) return res.status(404).json({ success: false, message: 'Not found.' }); res.json({ success: true, lab }); } catch (err) { next(err); } };
exports.deleteLab = async (req, res, next) => { try { await Lab.findOneAndUpdate({ labId: req.params.labId }, { isActive: false }); res.json({ success: true, message: 'Lab deactivated.' }); } catch (err) { next(err); } };
