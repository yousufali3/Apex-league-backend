import WalletService from '../services/wallet.service.js';

export const createDepositRequest = async (req, res) => {
  console.log(req);

  try {
    const result = await WalletService.createDepositRequest(
      req.user._id,
      req.body
    );
    res
      .status(200)
      .json({ message: 'Deposit request submitted', data: result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const approveDeposit = async (req, res) => {
  try {
    const { walletId, requestId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    const result = await WalletService.handleDepositRequest(
      walletId,
      requestId,
      action
    );
    res.status(200).json({ message: `Deposit ${action}d`, data: result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const createWithdrawalRequest = async (req, res) => {
  try {
    const result = await WalletService.withdraw(req.user._id, req.body);
    res
      .status(200)
      .json({ message: 'Withdrawal request submitted', data: result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const approveWithdrawal = async (req, res) => {
  try {
    const { walletId, requestId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    const result = await WalletService.handleWithdrawRequest(
      walletId,
      requestId,
      action
    );
    res.status(200).json({ message: `Withdrawal ${action}d`, data: result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
export const getPendingDeposits = async (req, res) => {
  try {
    const deposits = await WalletService.getAllPendingDeposits();
    res.status(200).json({ data: deposits });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPendingWithdrawals = async (req, res) => {
  try {
    const withdrawals = await WalletService.getAllPendingWithdrawals();
    res.status(200).json({ data: withdrawals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
