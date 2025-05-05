import User from '../models/User.js';
import { sendEmail } from '../utils/sendEmail.js';
import { generateOTP } from '../utils/generateOTP.js';

export const requestOtp = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');

  const otp = generateOTP();
  const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  user.otp = otp;
  user.otpExpiry = expiry;
  await user.save();

  await sendEmail(email, 'Your OTP Code', `Your OTP is ${otp}`);

  return { message: 'OTP sent to email' };
};

export const verifyOtpAndReset = async (email, otp, newPassword) => {
  console.log(email, otp, newPassword); // Debugging line

  const user = await User.findOne({ email });
  if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
    throw new Error('Invalid or expired OTP');
  }

  user.password = newPassword;
  user.otp = null;
  user.otpExpiry = null;
  await user.save();

  return { message: 'Password reset successful' };
};
