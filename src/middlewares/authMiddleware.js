import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const verifyToken = (role) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ message: 'No token provided' });
      console.log(token);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decoded, 'Decoded User');

      if (role === 'user') {
        const user = await User.findById(decoded.id);
        if (!user)
          return res.status(401).json({ message: 'Invalid user token' });
        req.user = user;
      } else if (role === 'admin') {
        const admin = await User.findById(decoded.id);
        console.log(admin, 'This is admin');

        if (!admin)
          return res.status(401).json({ message: 'Invalid admin token' });
        req.admin = admin;
      }
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Unauthorized' });
    }
  };
};
