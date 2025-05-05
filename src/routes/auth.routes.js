import express from 'express';
import { register, login } from '../controllers/auth.controller.js';
import {
  sendOtp,
  resetPassword,
} from '../controllers/forgotPasswordController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password/send-otp', sendOtp);
router.post('/forgot-password/reset', resetPassword);

export default router;
