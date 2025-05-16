import { Tournament } from '../models/Tournament.js';
import { calculateWinners } from '../services/ournamentResultService.js';
import { Wallet } from '../models/Wallet.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

export const addKills = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { killsData } = req.body; // [{ userId, kills }]

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament)
      return res.status(404).json({ message: 'Tournament not found' });

    killsData.forEach((killEntry) => {
      tournament.kills.push({
        userId: killEntry.userId,
        kills: killEntry.kills,
        isVerified: true,
      });
    });

    await tournament.save();
    res.status(200).json({ message: 'Kills added successfully', tournament });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const addRoomDetails = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { roomId, roomPassword } = req.body;

    if (!roomId || !roomPassword)
      return res
        .status(400)
        .json({ message: 'Room ID and Password are required' });

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament)
      return res.status(404).json({ message: 'Tournament not found' });

    tournament.roomId = roomId;
    tournament.roomPassword = roomPassword;
    await tournament.save();

    res
      .status(200)
      .json({ message: 'Room details updated successfully', tournament });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createTournament = async (req, res) => {
  console.log(req.body, 'This is body');

  try {
    const {
      title,
      description,
      mode, // 'solo', 'duo', 'squad'
      map,
      gameType, // 'Clash Squad', 'Full Map', 'Lone Wolf', 'Craftland'
      entryFee,
      prizePool,
      prizeBreakup,
      maxParticipants,
      matchDateTime,
    } = req.body;

    if (
      !title ||
      !mode ||
      !map ||
      !entryFee ||
      !prizePool ||
      !maxParticipants ||
      !matchDateTime
    )
      return res.status(400).json({ message: 'All fields are required' });

    console.log(req.admin, 'This is user');

    const tournament = await Tournament.create({
      title,
      description,
      mode,
      map,
      entryFee,
      prizePool,
      prizeBreakup,
      maxParticipants,
      matchDateTime,
      gameType,
      createdBy: req.admin._id,
    });

    res
      .status(201)
      .json({ message: 'Tournament created successfully', tournament });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const finalizeWinners = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const winners = await calculateWinners(tournamentId);
    res.status(200).json({ message: 'Winners finalized', winners });
  } catch (error) {
    console.error('Error finalizing winners:', error);
    res.status(500).json({ error: 'Failed to finalize winners' });
  }
};

export const getAllTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find().sort({ createdAt: -1 });
    res.status(200).json({ tournaments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const editTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const {
      title,
      description,
      mode,
      map,
      gameType,
      entryFee,
      prizePool,
      prizeBreakup,
      maxParticipants,
      matchDateTime,
    } = req.body;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament)
      return res.status(404).json({ message: 'Tournament not found' });

    tournament.title = title || tournament.title;
    tournament.description = description || tournament.description;
    tournament.mode = mode || tournament.mode;
    tournament.map = map || tournament.map;
    tournament.gameType = gameType || tournament.gameType;
    tournament.entryFee = entryFee || tournament.entryFee;
    tournament.prizePool = prizePool || tournament.prizePool;
    tournament.prizeBreakup = prizeBreakup || tournament.prizeBreakup;
    tournament.maxParticipants = maxParticipants || tournament.maxParticipants;
    tournament.matchDateTime = matchDateTime || tournament.matchDateTime;

    await tournament.save();
    res
      .status(200)
      .json({ message: 'Tournament updated successfully', tournament });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const tournament = await Tournament.findByIdAndDelete(tournamentId);
    if (!tournament)
      return res.status(404).json({ message: 'Tournament not found' });
    res.status(200).json({ message: 'Tournament deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updatePlayerResult = async (req, res) => {
  try {
    const { tournamentId, userId, kills, rank, reward } = req.body;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament)
      return res.status(404).json({ message: 'Tournament not found' });

    const player = tournament.registeredPlayers.find(
      (p) => p.userId.toString() === userId
    );
    if (!player)
      return res
        .status(404)
        .json({ message: 'Player not found in tournament' });

    // Update kills and rank
    player.kills = kills;
    player.rank = rank;

    await tournament.save();

    // Add reward to user's wallet
    if (reward > 0) {
      let wallet = await Wallet.findOne({ user: userId });
      if (!wallet) {
        wallet = new Wallet({
          user: userId,
          balance: reward,
          transactions: [],
        });
      } else {
        wallet.balance += reward;
      }

      wallet.transactions.push({
        type: 'credit',
        amount: reward,
        description: `Reward for ${tournament.title}`,
      });
      await wallet.save();
    }

    // Add to winners list
    tournament.winners.push({
      type: 'solo',
      userId,
      username: player.username,
      rank,
      kills,
      reward,
    });

    await tournament.save();

    res.json({ message: 'Player result updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateTeamResult = async (req, res) => {
  try {
    const { tournamentId, userId, kills, rank, reward } = req.body;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament)
      return res.status(404).json({ message: 'Tournament not found' });

    const team = tournament.registeredTeams.find(
      (t) => t.userId.toString() === userId
    );
    if (!team)
      return res.status(404).json({ message: 'Team not found in tournament' });

    team.kills = kills;
    team.rank = rank;

    await tournament.save();

    if (reward > 0) {
      let wallet = await Wallet.findOne({ user: userId });
      if (!wallet) {
        wallet = new Wallet({
          user: userId,
          balance: reward,
          transactions: [],
        });
      } else {
        wallet.balance += reward;
      }

      wallet.transactions.push({
        type: 'credit',
        amount: reward,
        description: `Team reward for ${tournament.title}`,
      });
      await wallet.save();
    }

    tournament.winners.push({
      type: 'team',
      userId,
      teamName: team.teamName,
      rank,
      kills,
      reward,
    });

    await tournament.save();

    res.json({ message: 'Team result updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateTournamentWinner = async (req, res) => {
  try {
    const { tournamentId, userId, rank, kills, amountWon, name } = req.body;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament)
      return res.status(404).json({ message: 'Tournament not found' });

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // === SOLO Mode ===
    if (tournament.mode === 'solo') {
      const player = tournament.registeredPlayers.find(
        (p) => p.userId.toString() === userId
      );
      if (!player)
        return res
          .status(404)
          .json({ message: 'Player not found in tournament' });

      player.kills = kills;
      player.rank = rank;
    }

    // === DUO / SQUAD Mode ===
    else {
      const team = tournament.registeredTeams.find(
        (t) => t.userId.toString() === userId
      );
      if (!team)
        return res
          .status(404)
          .json({ message: 'Team not found in tournament' });

      team.kills = kills;
      team.rank = rank;
    }

    // Add to winners array
    tournament.winners.push({
      rank,
      name,
      kills,
      amountWon,
      userId: userObjectId,
    });

    await tournament.save();

    // === Add Deposit Request to Wallet ===
    const wallet = await Wallet.findOne({ user: userObjectId });
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });

    wallet.depositRequests.push({
      amount: amountWon,
      transactionId: `reward-${tournamentId}-${userId}`,
      status: 'approved',
      requestedAt: new Date(),
      resolvedAt: new Date(),
    });

    // Increase wallet balance
    wallet.balance += amountWon;

    await wallet.save();

    return res.status(200).json({
      message:
        'Winner updated, rank/kills saved, and reward deposited successfully.',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
