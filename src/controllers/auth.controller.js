import { registerUser, loginUser } from '../services/userService.js';

export const register = async (req, res) => {
  try {
    const userData = await registerUser(req.body);
    res.status(201).json(userData);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const userData = await loginUser(req.body);
    res.status(200).json(userData);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};
