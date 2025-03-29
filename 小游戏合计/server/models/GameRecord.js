const mongoose = require('mongoose');

const GameRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gameType: {
    type: String,
    enum: ['minesweeper', 'snake', 'tetris'],
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  time: {
    type: Number,
    default: null
  },
  completed: {
    type: Boolean,
    default: false
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// 创建复合索引以便快速查询
GameRecordSchema.index({ user: 1, gameType: 1, date: -1 });

module.exports = mongoose.model('GameRecord', GameRecordSchema); 