const mongoose = require('mongoose');

const Configuration = mongoose.model('Configuration', {
  barbersCount: Number,
  maxBarbers: Number,
});

module.exports = Configuration;
