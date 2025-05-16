import express from 'express';
import {
  createTournament,
  addRoomDetails,
  addKills,
  finalizeWinners,
  getAllTournaments,
  editTournament,
  deleteTournament,
  updatePlayerResult,
  updateTeamResult,
  updateTournamentWinner,
} from '../controllers/adminTournamentController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Only admin can create tournament
router.post('/create', verifyToken('admin'), createTournament);
router.post('/edit/:tournamentId', editTournament);
router.post('/delete/:tournamentId', deleteTournament);
router.get('/get-all-tournaments', getAllTournaments);
router.put('/room-details/:tournamentId', addRoomDetails);
router.put('/kills/:tournamentId', verifyToken('admin'), addKills);
router.post('/finalize-winners/:tournamentId', finalizeWinners);

router.post('/update-player-result', updatePlayerResult);
router.post('/update-team-result', updateTeamResult);
router.post('/update-result', updateTournamentWinner);

export default router;
