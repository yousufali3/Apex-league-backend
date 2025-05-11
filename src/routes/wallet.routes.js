import express from 'express';
import {
  createDepositRequest,
  approveDeposit,
  createWithdrawalRequest,
  getPendingDeposits,
  getPendingWithdrawals,
  approveWithdrawal,
  getTransactionHistory,
} from '../controllers/wallet.controller.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { addRoomDetails } from '../controllers/adminTournamentController.js';

const router = express.Router();

// User actions
router.post('/deposit', verifyToken('user'), createDepositRequest); // User initiates deposit
router.post('/withdraw', verifyToken('user'), createWithdrawalRequest); // User initiates withdrawal

// Admin actions
router.patch('/deposit/:walletId/:requestId', approveDeposit); // Admin approves/rejects deposit
router.patch('/withdraw/:walletId/:requestId', approveWithdrawal); // Admin approves/rejects withdrawal

router.get('/admin/pending-deposits', verifyToken('admin'), getPendingDeposits);
router.get('/admin/pending-withdrawals', getPendingWithdrawals);

router.get('/transactions', verifyToken('user'), getTransactionHistory);
router.post('/add-room-details', addRoomDetails);
export default router;
