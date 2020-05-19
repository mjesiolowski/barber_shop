const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Barber',
    required: true,
  },
  month: {
    type: Date,
    required: true,
  },
  availability: [{
    day: Number,
    hours: [{
      hour: {
        type: Number,
        required: true,
      },
      status: String,
      clientName: String,
      serviceType: String,
    }],
  }],
});

const Availability = mongoose.model('Availability', availabilitySchema);

module.exports = Availability;
