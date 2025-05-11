import express from 'express';
import {
  createTournament,
  addRoomDetails,
  addKills,
  finalizeWinners,
} from '../controllers/adminTournamentController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Only admin can create tournament
router.post('/create', verifyToken('admin'), createTournament);
router.put('/room-details/:tournamentId', verifyToken('admin'), addRoomDetails);
router.put('/kills/:tournamentId', verifyToken('admin'), addKills);
router.post('/finalize-winners/:tournamentId', finalizeWinners);

export default router;
