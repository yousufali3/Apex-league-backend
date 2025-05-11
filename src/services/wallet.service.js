// services/wallet.service.js
import { Wallet } from '../models/Wallet.js';

const WalletService = {
  // Create deposit request by user
  createDepositRequest: async (userId, { amount, transactionId }) => {
    console.log(userId, amount, transactionId, 'Deposit Request Data');

    if (!amount || amount <= 0 || !transactionId) {
      throw new Error('Invalid deposit request');
    }

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) throw new Error('Wallet not found');

    wallet.depositRequests.push({ amount, transactionId });
    return await wallet.save();
  },

  // Admin handles deposit approval/rejection
  handleDepositRequest: async (walletId, requestId, action) => {
    const wallet = await Wallet.findById(walletId);
    if (!wallet) throw new Error('Wallet not found');

    const request = wallet.depositRequests.id(requestId);
    if (!request || request.status !== 'pending') {
      throw new Error('Invalid or already processed deposit request');
    }

    if (action === 'approve') {
      wallet.balance += request.amount;
      wallet.transactions.push({
        type: 'credit',
        amount: request.amount,
        description: 'Deposit approved',
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

  // Create withdrawal request by user
  // Create withdrawal request by user
  withdraw: async (
    userId,
    { amount, paymentMethod, upiDetails, bankDetails }
  ) => {
    if (!amount || amount <= 0 || !paymentMethod) {
      throw new Error('Invalid withdrawal request');
    }

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) throw new Error('Wallet not found');
    if (wallet.balance < amount) throw new Error('Insufficient balance');

    // Basic validation for payment details
    if (paymentMethod === 'upi') {
      if (!upiDetails?.upiId) {
        throw new Error('UPI ID is required for UPI withdrawals.');
      }
    } else if (paymentMethod === 'bank') {
      const { bankName, accountNumber, ifscCode, accountHolderName } =
        bankDetails || {};
      if (!bankName || !accountNumber || !ifscCode || !accountHolderName) {
        throw new Error('All bank details are required for bank withdrawals.');
      }
    } else {
      throw new Error('Invalid payment method.');
    }

    // Add the withdrawal request to the wallet
    wallet.withdrawalRequests.push({
      amount,
      paymentMethod,
      upiDetails,
      bankDetails,
    });

    return await wallet.save();
  },

  // Admin handles withdrawal approval/rejection
  handleWithdrawRequest: async (walletId, requestId, action) => {
    const wallet = await Wallet.findById(walletId);
    if (!wallet) throw new Error('Wallet not found');

    const request = wallet.withdrawalRequests.id(requestId);
    if (!request || request.status !== 'pending') {
      throw new Error('Invalid or already processed withdrawal request');
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

  getAllPendingDeposits: async () => {
    return await Wallet.find({ 'depositRequests.status': 'pending' })
      .select('user depositRequests')
      .populate('user', 'name email') // Optional: show user info
      .lean();
  },

  getAllPendingWithdrawals: async () => {
    return await Wallet.find({ 'withdrawalRequests.status': 'pending' })
      .select('user withdrawalRequests')
      .populate('user', 'name email') // Optional: show user info
      .lean();
  },
};

export default WalletService;
