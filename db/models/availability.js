const mongoose = require('mongoose');
const validator = require('validator');

const availabilitySchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  month: {
    type: String,
    required: true,
    validate(value) {
      if (!validator.isInt(value, { min: 1, max: 12 })) {
        throw new Error('Month is invalid');
      }
    },
  },
  day: {
    type: String,
    required: true,
    validate(value) {
      if (!validator.isInt(value, { min: 1, max: 31 })) {
        throw new Error('Day is invalid');
      }
    },
  },
  hours: [{
    hour: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    clientName: String,
    serviceType: String,
  }],
});

const Availability = mongoose.model('Availability', availabilitySchema);

module.exports = Availability;
