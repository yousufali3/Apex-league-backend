import mongoose from 'mongoose';
import registeredPlayerSchema from './Player.js';
import registeredTeamSchema from './Team.js';

const prizeBreakupSchema = new mongoose.Schema({
  type: { type: String, enum: ['rank', 'per_kill', 'both'], required: true },

  // Rank-based prize: [{ from: 1, to: 2, amount: 100 }]
  rankPrizes: [
    {
      from: { type: Number },
      to: { type: Number },
      amount: { type: Number },
    },
  ],

  // Per kill reward
  perKillAmount: { type: Number },
});

const tournamentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    mode: { type: String, enum: ['solo', 'duo', 'squad'], required: true },
    map: { type: String },
    entryFee: { type: Number },
    prizePool: { type: Number },
    prizeBreakup: prizeBreakupSchema,
    maxParticipants: { type: Number },
    matchDateTime: { type: Date },
    gameType: {
      type: String,
      enum: [
        'Clash Squad',
        'Full Map',
        'Lone Wolf',
        'Craft Land',
        'Free Match',
      ],
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    participantsCount: {
      type: Number,
      default: 0,
    },

    registeredPlayers: [registeredPlayerSchema],
    registeredTeams: [registeredTeamSchema],
    roomId: { type: String },
    roomPassword: { type: String },
    winners: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { timestamps: true }
);

export const Tournament = mongoose.model('Tournament', tournamentSchema);
