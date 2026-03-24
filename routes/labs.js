const express = require('express');
const router = express.Router();
const { getAllLabs, getLabById, getSubjectSummary, submitQuiz, logSimulation, getLabStats, createLab, updateLab, deleteLab } = require('../controllers/labController');
const { protect, optionalAuth, requireRole } = require('../middleware/auth');

router.get ('/',                 getAllLabs);
router.get ('/subjects/summary', getSubjectSummary);
router.get ('/:labId',           getLabById);
router.get ('/:labId/stats',     getLabStats);
router.post('/:labId/quiz',      protect,                 submitQuiz);
router.post('/:labId/simulate',  optionalAuth,            logSimulation);
router.post('/',                 protect, requireRole('admin'), createLab);
router.put ('/:labId',           protect, requireRole('admin'), updateLab);
router.delete('/:labId',         protect, requireRole('admin'), deleteLab);

module.exports = router;
