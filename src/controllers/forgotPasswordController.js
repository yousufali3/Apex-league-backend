import {
  requestOtp,
  verifyOtpAndReset,
} from '../services/forgotPasswordService.js';

export const sendOtp = async (req, res) => {
  try {
    const response = await requestOtp(req.body.email);
    res.status(200).json(response);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const response = await verifyOtpAndReset(email, otp, newPassword);
    res.status(200).json(response);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
