const path = require('path');
const express = require('express');
const cors = require('cors');
require('../db/mongoose');
const moment = require('moment');
const Barber = require('../db/models/barber');
const Availability = require('../db/models/availability');

const app = express();
const publicPath = path.join(__dirname, '..', 'public');

app.use(cors());
app.use(express.json());
app.use(express.static(publicPath));

app.post('/barbers', async (req, res) => {
  const { body } = req;

  const barber = new Barber(body);

  try {
    await barber.save();
    res.send(barber);
  } catch (e) {
    res.status(400);
    res.send('couldn\'t create');
  }
});

app.post('/availability', async (req, res) => {
  const { body } = req;

  const availability = new Availability(body);
  const { date } = availability;

  console.log(date);
  console.log('moment: ', moment(date).format('DD-MM-YYYY'));
  res.send('good');
  try {
    // await availability.save();
    // res.send(availability);

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
    // );
    const isDateInDatabse = await Availability.findOne({ date });
    console.log(isDateInDatabse);
  } catch (e) {
    res.status(400);
    res.send('couldn\'t create');
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

module.exports = app;
