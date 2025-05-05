import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/generateToken.js';

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

  console.log(name, email, password, confirmPassword, phone); // Debugging line

  const userExists = await User.findOne({ email });
  if (userExists) throw new Error('User already exists');

  const user = await User.create({ name, email, password, phone });

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    wallet: user.wallet,
    token: generateToken(user),
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  const isMatch = user && (await user.matchPassword(password));

  console.log(email, password); // Debugging line

  if (!isMatch) throw new Error('Invalid credentials');

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    wallet: user.wallet,
    token: generateToken(user),
  };
};
