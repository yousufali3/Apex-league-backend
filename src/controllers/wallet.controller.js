import WalletService from '../services/wallet.service.js';

export const deposit = async (req, res) => {
  try {
    const result = await WalletService.deposit(req.user._id, req.body);
    res.status(200).json({ message: 'Deposit successful', data: result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const withdraw = async (req, res) => {
  try {
    const result = await WalletService.withdraw(req.user._id, req.body);
    res
      .status(200)
      .json({ message: 'Withdraw request submitted', data: result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const approveWithdraw = async (req, res) => {
  try {
    const { walletId, requestId } = req.params;
    const { action } = req.body;
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
