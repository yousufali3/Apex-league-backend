import mongoose from 'mongoose';

const teamPlayerSchema = new mongoose.Schema({
  username: { type: String, required: true },
  gameUid: { type: String, required: true },
});

const registeredTeamSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  teamName: { type: String, required: true },
  players: [teamPlayerSchema], // 2 or 4 players depending on mode
  kills: { type: Number, default: 0 }, // Total kills for the team
  rank: { type: Number, default: 0 }, // Rank for the team
});

export default registeredTeamSchema;
