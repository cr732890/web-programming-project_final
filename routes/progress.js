const express = require('express');
const router = express.Router();
const { getDashboard, getHistory, getLeaderboard, getLabProgress } = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

router.get('/dashboard',   protect, getDashboard);
router.get('/history',     protect, getHistory);
router.get('/leaderboard', getLeaderboard);
router.get('/lab/:labId',  protect, getLabProgress);

module.exports = router;
