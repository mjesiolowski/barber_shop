const mongoose = require('mongoose');
const validator = require('validator');

const barberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid');
      }
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
  },
});

barberSchema.virtual('availability', {
  ref: 'Availability',
  localField: '_id',
  foreignField: 'author',
});

const Barber = mongoose.model('Barber', barberSchema);

module.exports = Barber;
