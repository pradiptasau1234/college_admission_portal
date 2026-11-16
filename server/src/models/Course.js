const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    default: '4 Years'
  },
  degree: {
    type: String,
    default: 'B.Tech'
  },
  intakeSeats: {
    type: Number,
    default: 120
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Course', courseSchema);
