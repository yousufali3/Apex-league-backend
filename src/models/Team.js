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
  players: [teamPlayerSchema],
  kills: { type: Number, default: 0 },
  rank: { type: Number, default: 0 },
});

export default registeredTeamSchema;
