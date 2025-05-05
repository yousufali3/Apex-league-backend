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
});

export default registeredTeamSchema;
