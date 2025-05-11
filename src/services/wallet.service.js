import { Wallet } from '../models/Wallet.js';

const WalletService = {
  deposit: async (userId, { amount, description }) => {
    if (!amount || amount <= 0) throw new Error('Invalid amount');

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) throw new Error('Wallet not found');

    wallet.balance += amount;
    wallet.transactions.push({ type: 'credit', amount, description });

    return await wallet.save();
  },

  withdraw: async (userId, { amount, upiOrAccount }) => {
    if (!amount || amount <= 0 || !upiOrAccount) {
      throw new Error('Invalid withdrawal request');
    }

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) throw new Error('Wallet not found');
    if (wallet.balance < amount) throw new Error('Insufficient balance');

    wallet.withdrawalRequests.push({ amount, upiOrAccount });
    return await wallet.save();
  },

  handleWithdrawRequest: async (walletId, requestId, action) => {
    const wallet = await Wallet.findById(walletId);
    if (!wallet) throw new Error('Wallet not found');

    const request = wallet.withdrawalRequests.id(requestId);
    if (!request || request.status !== 'pending') {
      throw new Error('Invalid or already processed request');
    }

    if (action === 'approve') {
      if (wallet.balance < request.amount)
        throw new Error('Insufficient balance');

      wallet.balance -= request.amount;
      wallet.transactions.push({
        type: 'debit',
        amount: request.amount,
        description: 'Withdrawal approved',
      });

      request.status = 'approved';
      request.resolvedAt = new Date();
    } else if (action === 'reject') {
      request.status = 'rejected';
      request.resolvedAt = new Date();
    } else {
      throw new Error('Invalid action');
    }

    return await wallet.save();
  },
};

export default WalletService;
