import { Tournament } from '../models/Tournament.js';
import { calculateWinners } from '../services/ournamentResultService.js';

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
