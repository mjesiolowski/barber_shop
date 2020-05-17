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

const Barber = mongoose.model('Barber', {
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
  availability: [{}],
});

const Availability = mongoose.model('Availability', {
  date: Date,
  hours: [{
    hour: Number,
    status: String,
    clientName: String,
    serviceType: String,
  }],
});

const availability1 = new Availability({
  date: utcDate,
  hours: [{
    hour: 800,
    status: 'occupied',
    clientName: 'John Dee',
    serviceType: 'combo',
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
  password: 'test',
  availability: [
    {
      [utcDate]: {
        800: {
          status: 'occupied',
          clientName: 'John Dee',
          serviceType: 'combo',
        },
      },
    },
    {
      [utcDate]: {
        830: {
          status: 'occupied',
          clientName: 'John Dee',
          serviceType: 'combo',
        },
      },
    },
  ],
});

// availability1.save()
//   .then((e) => console.log('saved: ', e))
//   .catch((e) => console.log(e));

// Availability.findOneAndUpdate(
//   { date: utcDate },
//   {
//     $push: {
//       hours: {
//         hour: 830,
//         status: 'occupied',
//         clientName: 'John Dee',
//         serviceType: 'combo',
//       },
//     },
//   },
// )
//   .then((resp) => console.log(resp))
//   .catch((e) => console.log(e));
