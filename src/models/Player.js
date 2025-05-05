import mongoose from 'mongoose';

const registeredPlayerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  username: { type: String, required: true },
  gameUid: { type: String, required: true },
});

export default registeredPlayerSchema;
