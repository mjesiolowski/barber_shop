const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  }).then(() => {
    console.log('Succesfully connected to the DB')
    console.log(process.env.MONGODB_URL)
  })
  .catch((e) => {
    console.log(`DB error: ${e}`)
  })