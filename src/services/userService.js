import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/generateToken.js';
import { Wallet } from '../models/Wallet.js';

export const registerUser = async ({
  name,
  email,
  password,
  confirmPassword,
  phone,
}) => {
  if (password !== confirmPassword) {
    throw new Error('Passwords do not match');
  }

  const userExists = await User.findOne({ email });
  if (userExists) throw new Error('User already exists');

  // Step 1: Create the user
  const user = await User.create({ name, email, password, phone });

  // Step 2: Create wallet
  const wallet = await Wallet.create({
    user: user._id,
    balance: 0,
    transactions: [],
    withdrawalRequests: [],
  });

  // Step 3: Attach wallet to user
  user.wallet = wallet._id;
  await user.save(); // This is important

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    wallet: {
      _id: wallet._id,
      balance: wallet.balance,
    },
    token: generateToken(user),
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  const isMatch = user && (await user.matchPassword(password));

  console.log(user); // Debugging line

  if (!isMatch) throw new Error('Invalid credentials');

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    wallet: user.wallet,
    phone: user.phone,
    token: generateToken(user),
  };
};
