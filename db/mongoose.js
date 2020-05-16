const mongoose = require('mongoose');

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


const User = mongoose.model('User', {
  name: {
    type: String,
  },
  type: {
    type: String,
  },
  availability: {
    type: Array,
    default: [],
  },
});

// const Availability = mongoose.model('Availability', {

// });

const me = new User({
  name: 'barber1',
  type: 'employee',
});

me.save()
  .then((e) => console.log('saved: ', e))
  .catch((e) => console.log(e));
