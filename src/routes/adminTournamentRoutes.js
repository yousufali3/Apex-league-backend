import express from 'express';
import {
  createTournament,
  addRoomDetails,
  addKills,
} from '../controllers/adminTournamentController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Only admin can create tournament
router.post('/create', verifyToken('admin'), createTournament);
router.put('/room-details/:tournamentId', verifyToken('admin'), addRoomDetails);
router.put('/kills/:tournamentId', verifyToken('admin'), addKills);

export default router;
