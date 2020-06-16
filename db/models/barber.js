const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
  tokens: [{
    token: {
      type: String,
      required: true,
    },
  }],
});

barberSchema.virtual('availability', {
  ref: 'Availability',
  localField: '_id',
  foreignField: 'author',
});

barberSchema.methods.generateToken = async function () {
  const barber = this;

  const token = jwt.sign({ _id: barber.id.toString() }, 'testsecret');

  barber.tokens = [...barber.tokens, { token }];
  await barber.save();

  return token;
};

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
