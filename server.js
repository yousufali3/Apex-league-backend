import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import connectDB from './src/config/db.js';
import authRoutes from './src/routes/auth.routes.js';
import tournamentRoutes from './src/routes/tournamentRoutes.js';
import adminTournamentRoutes from './src/routes/adminTournamentRoutes.js';
import walletRoutes from './src/routes/wallet.routes.js';
// Import Routes

// Middleware Imports

// MongoDB Connection

// App Init
const app = express();

// Middlewares
app.use(
  cors({
    origin: '*',
  })
);
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

connectDB(); // Connect to MongoDB

// Routes

app.use('/api/auth', authRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/admin/tournament', adminTournamentRoutes);
app.use('/api/wallet', walletRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});
// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
