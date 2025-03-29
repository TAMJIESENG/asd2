const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  gameStats: {
    minesweeper: {
      played: { type: Number, default: 0 },
      won: { type: Number, default: 0 },
      bestTime: { type: Number, default: null }
    },
    snake: {
      played: { type: Number, default: 0 },
      highScore: { type: Number, default: 0 }
    },
    tetris: {
      played: { type: Number, default: 0 },
      highScore: { type: Number, default: 0 }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema); 