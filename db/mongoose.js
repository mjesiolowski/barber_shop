const mongoose = require('mongoose');
const Barber = require('./models/barber');
const Availability = require('./models/availability');

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
  name: 'Import',
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
