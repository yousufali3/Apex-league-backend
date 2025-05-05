import express from 'express';
import {
  registerSolo,
  registerTeam,
  listTournaments,
  getRoomDetails,
  filterTournaments,
  getMyRegisteredTournaments,
} from '../controllers/tournamentController.js';

import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();
// already existing routes
router.post('/register/solo', verifyToken('user'), registerSolo);
router.post('/register/team', verifyToken('user'), registerTeam);
router.get('/room-details/:tournamentId', verifyToken('user'), getRoomDetails);
router.post('/filter', filterTournaments);
router.post('/my-registered', verifyToken('user'), getMyRegisteredTournaments);

// new route
router.get('/list', listTournaments);

export default router;
