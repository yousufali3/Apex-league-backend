import express from 'express';
import {
  deposit,
  withdraw,
  approveWithdraw,
} from '../controllers/wallet.controller.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/deposit', verifyToken('user'), deposit);
router.post('/withdraw', verifyToken('user'), withdraw);
router.patch(
  '/withdraw/:walletId/:requestId',
  verifyToken('admin'),
  approveWithdraw
);

export default router;
