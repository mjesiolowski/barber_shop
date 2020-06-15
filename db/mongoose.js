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
