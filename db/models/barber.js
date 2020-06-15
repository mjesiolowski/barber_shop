const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const barberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
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

barberSchema.statics.findByCredentials = async (email, password) => {
  // eslint-disable-next-line no-use-before-define
  const barber = await Barber.findOne({ email });

  if (!barber) {
    throw new Error('Unable to login!');
  }

  const doesPasswordMatch = await bcrypt.compare(password, barber.password);

  if (!doesPasswordMatch) {
    throw new Error('Unable to login!');
  }

  return barber;
};

barberSchema.pre('save', async function (next) {
  const barber = this;

  if (barber.isModified('password')) {
    barber.password = await bcrypt.hash(barber.password, 8);
  }

  next();
});

const Barber = mongoose.model('Barber', barberSchema);

module.exports = Barber;
