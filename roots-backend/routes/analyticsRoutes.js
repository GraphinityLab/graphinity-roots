import express from 'express';

import User from '../models/User.js';

const router = express.Router();

// ✅ GET /api/analytics/leaderboard - Top 10 users by views
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find()
      .sort({ views: -1 })
      .limit(10)
      .select('username views');

    res.status(200).json(users);
  } catch (err) {
    console.error('Leaderboard error:', err.message);
    res.status(500).json({ message: 'Failed to load leaderboard' });
  }
});

export default router;
