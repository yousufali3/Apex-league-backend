// models/wallet.model.js
import mongoose from 'mongoose';
// import { User } from './User.js'; // Assuming you have a User model
const withdrawalRequestSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  upiOrAccount: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  requestedAt: { type: Date, default: Date.now },
  resolvedAt: Date,
});

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  balance: { type: Number, default: 0 },
  transactions: [
    {
      type: { type: String, enum: ['credit', 'debit'], required: true },
      amount: { type: Number, required: true },
      description: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  withdrawalRequests: [withdrawalRequestSchema],
});

export const Wallet = mongoose.model('Wallet', walletSchema);
