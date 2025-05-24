import express from 'express';

import {
  deleteUser,
  getMe,
  updateUser,
  updateUserByUsername,
  uploadImage,
} from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

router.get("/me", authMiddleware, getMe);
router.put("/update", authMiddleware, updateUser);
router.delete("/delete", authMiddleware, deleteUser);
router.post('/upload', authMiddleware, upload.single('image'), uploadImage);

// ✅ ADD THIS ROUTE
router.put('/:username/edit', authMiddleware, updateUserByUsername);

export default router;
