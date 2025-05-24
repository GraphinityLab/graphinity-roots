import express from 'express';

import {
  loginUser,
  logoutUser,
  registerUser,
} from '../controllers/authController.js';
import {
  loginRateLimiter,
  registerRateLimiter,
} from '../middlewares/rateLimiter.js';

const router = express.Router();

router.post("/register", registerRateLimiter, registerUser);
router.post("/login", loginRateLimiter, loginUser);

router.post("/logout", logoutUser);
export default router;
