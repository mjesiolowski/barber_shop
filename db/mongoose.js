const mongoose = require('mongoose');
const validator = require('validator');

mongoose.connect('mongodb://127.0.0.1:27017/barber-shop-api', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Succesfully connected to the DB');
  console.log('mongodb://127.0.0.1:27017/barber-shop-api');
})
  .catch((e) => {
    console.log(`DB error: ${e}`);
  });


const utcDate = new Date().toJSON().slice(0, 10).replace(/-/g, '/');

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

const Availability = mongoose.model('Availability', {
  date: Date,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Barber',
  },
  hours: [{
    hour: Number,
    status: String,
    clientName: String,
    serviceType: String,
  }],
});

// const availability2 = new Availability({
//   date: utcDate,
//   hours: [{
// hour: 830,
// status: 'occupied',
// clientName: 'John Dee',
// serviceType: 'combo',
//   }],
// });

const barber1 = new Barber({
  name: 'barber1',
  email: 'barber1@barber-shop.pl',
  password: 'test123456',
  // eslint-disable-next-line
  // availability: availability1._id,
});

const availability1 = new Availability({
  date: utcDate,
  // eslint-disable-next-line
  author: barber1._id,
  hours: [{
    hour: 800,
    status: 'occupied',
    clientName: 'John Dee',
    serviceType: 'combo',
  }],
});


// barber1.save()
//   .then((e) => console.log('saved: ', e))
//   .catch((e) => console.log(e));

// availability1.save()
//   .then((e) => console.log('saved: ', e))
//   .catch((e) => console.log(e));
