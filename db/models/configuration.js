const mongoose = require('mongoose');

const configurationSchema = new mongoose.Schema({
  adminCount: {
    type: Number,
    required: true,
  },
  barbersCount: {
    type: Number,
    required: true,
  },
  openingHour: {
    type: Number,
    required: true,
  },
  closingHour: {
    type: Number,
    required: true,
  },
});

const Configuration = mongoose.model('Configuration', configurationSchema);

module.exports = Configuration;
