import { Tournament } from '../models/Tournament.js';
import { Wallet } from '../models/Wallet.js';

// ✅ GET Room Details for registered users
export const getRoomDetails = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const userId = req.user.id;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament)
      return res.status(404).json({ message: 'Tournament not found' });

    let isRegistered = false;

    if (tournament.mode === 'solo') {
      isRegistered = tournament.registeredPlayers.some(
        (p) => p.userId.toString() === userId
      );
    } else {
      isRegistered = tournament.registeredTeams.some((team) =>
        team.players.some((player) => player.userId.toString() === userId)
      );
    }

    if (!isRegistered)
      return res
        .status(403)
        .json({ message: 'You are not registered in this tournament' });

    res.status(200).json({
      roomId: tournament.roomId,
      roomPassword: tournament.roomPassword,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ LIST All Tournaments
export const listTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find().sort({ createdAt: -1 });
    res.status(200).json({ tournaments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyRegisteredTournaments = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(userId, 'User ID from token');

    const tournaments = await Tournament.find({
      $or: [
        { 'registeredPlayers.userId': userId },
        { 'registeredTeams.players.userId': userId },
        { 'registeredTeams.userId': userId },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({ tournaments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const filterTournaments = async (req, res) => {
  try {
    const { gameType, mode } = req.body || {};

    const filter = {};
    if (gameType && gameType !== '') filter.gameType = gameType;
    if (mode && mode !== '') filter.mode = mode;

    const tournaments = await Tournament.find(filter).sort({ createdAt: -1 });

    res.status(200).json({ tournaments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ REGISTER Solo
export const registerSolo = async (req, res) => {
  try {
    const { tournamentId, username, gameUid } = req.body;
    const userId = req.user.id;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament)
      return res.status(404).json({ message: 'Tournament not found' });

    if (tournament.mode !== 'solo')
      return res.status(400).json({ message: 'Not a solo tournament' });

    if (tournament.participantsCount >= tournament.maxParticipants)
      return res.status(400).json({ message: 'Tournament is full' });

    // const alreadyRegistered = tournament.registeredPlayers.some((p) => {
    //   console.log(p.userId.toString(), userId);

    //   p.userId.toString() === userId;
    // });
    // if (alreadyRegistered)
    //   return res.status(400).json({ message: 'Already registered' });

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) return res.status(400).json({ message: 'Wallet not found' });

    if (wallet.balance < tournament.entryFee)
      return res.status(400).json({ message: 'Insufficient balance' });

    // Deduct Entry Fee
    wallet.balance -= tournament.entryFee;
    wallet.transactions.push({
      type: 'debit',
      amount: tournament.entryFee,
      description: `Entry fee for tournament: ${tournament.title}`,
    });
    await wallet.save();

    // Register player
    tournament.registeredPlayers.push({
      userId,
      username,
      gameUid,
    });
    tournament.participantsCount += 1;
    await tournament.save();

    res
      .status(200)
      .json({ message: 'Successfully registered for solo tournament' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ REGISTER Team (Duo or Squad)
export const registerTeam = async (req, res) => {
  try {
    const { tournamentId, teamName, players } = req.body;
    const userId = req.user.id;
    console.log(userId, 'User ID from token');

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament)
      return res.status(404).json({ message: 'Tournament not found' });

    if (!['duo', 'squad'].includes(tournament.mode))
      return res.status(400).json({ message: 'Not a team tournament' });

    const expectedCount = tournament.mode === 'duo' ? 2 : 4;

    if (players.length !== expectedCount)
      return res
        .status(400)
        .json({ message: `Exactly ${expectedCount} players required` });

    if (
      tournament.participantsCount + expectedCount >
      tournament.maxParticipants
    ) {
      return res.status(400).json({ message: 'Tournament is full' });
    }

    // const alreadyRegistered = tournament.registeredTeams.some((p) => {
    //   console.log(p), 'this is p';

    //   p.userId.toString() === userId;
    // });
    // if (alreadyRegistered)
    //   return res.status(400).json({ message: 'Already registered' });

    const creatorId = req.user.id;

    console.log(creatorId, 'req.user');

    const wallet = await Wallet.findOne({ user: creatorId });
    console.log(wallet, 'wallet');
    if (!wallet) return res.status(400).json({ message: 'Wallet not found' });

    const totalFee = tournament.entryFee * expectedCount;

    if (wallet.balance < totalFee)
      return res.status(400).json({ message: 'Insufficient balance' });

    // Deduct Entry Fee
    wallet.balance -= totalFee;
    wallet.transactions.push({
      type: 'debit',
      amount: totalFee,
      description: `Team entry fee for tournament: ${tournament.title}`,
    });
    await wallet.save();

    // Add team to tournament
    tournament.registeredTeams.push({
      userId: req.user._id,
      teamName,
      players,
    });
    tournament.participantsCount += expectedCount;
    await tournament.save();

    res
      .status(200)
      .json({ message: 'Successfully registered team for tournament' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
