import express from 'express';

import { getPublicProfile } from '../controllers/userController.js';
import User from '../models/User.js';

const router = express.Router();

// In-memory cache for IP tracking
const viewCache = new Map(); // key = `${ip}:${username}`
const VIEW_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// ✅ GET /roots/:username - Public profile data
router.get('/:username', getPublicProfile);

// ✅ POST /roots/:username/view - Count views once per IP per hour
router.post('/:username/view', async (req, res) => {
  try {
    const { username } = req.params;

    // Get real IP (handle proxy)
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.socket?.remoteAddress ||
      'unknown';

    const key = `${ip}:${username}`;
    const now = Date.now();

    const lastView = viewCache.get(key);
    if (lastView && now - lastView < VIEW_WINDOW_MS) {
      return res.status(200).json({ message: 'Already viewed recently', skipped: true });
    }

    viewCache.set(key, now);

    const user = await User.findOneAndUpdate(
      { username },
      { $inc: { views: 1 } },
      { new: true }
    ).select('username views');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      message: 'View recorded',
      views: user.views,
    });
  } catch (err) {
    console.error('View error:', err.message);
    res.status(500).json({ message: 'Error recording view' });
  }
});

export default router;
