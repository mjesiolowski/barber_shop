const path = require('path');
const express = require('express');
const cors = require('cors');
require('../db/mongoose');
const mongoose = require('mongoose');
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

app.get('/availability', async (req, res) => {
  const { body } = req;
  const { month, day, author } = body;

  try {
    const document = await Availability.find(
      { month, day, author: mongoose.Types.ObjectId(author) }, 'hours',
    );

    if (!document.length) {
      return res.status(404).send({ error: 'Couldn\'t find the date' });
    }

    res.send(document);
  } catch (e) {
    res.status(404).send(e);
  }
});

app.delete('/availability', async (req, res) => {
  const { body } = req;
  const {
    month, day, author, hour,
  } = body;

  try {
    const document = await Availability.findOneAndUpdate(
      {
        month, day, author: mongoose.Types.ObjectId(author),
      },
      {
        $pull: { hours: { hour } },
      },
      { new: true },
    );

    res.send(document);
  } catch (e) {
    res.status(404).send(e);
  }
});

app.post('/availability', async (req, res) => {
  const { body } = req;
  const {
    month, day, hours, author,
  } = body;

  const availability = new Availability({
    author: mongoose.Types.ObjectId(author),
    month,
    day,
    hours: [
      hours,
    ],
  });

  const isDateInDatabase = await Availability.find(
    { month, day },
  );

  const isHourInDatabase = await Availability.find(
    { month, day, 'hours.hour': hours.hour },
  );

  const isHourReadyToUpdate = await Availability.find(
    {
      month, day, 'hours.hour': hours.hour, 'hours.status': 'READY',
    },
  );

  try {
    if (!isDateInDatabase.length) {
      await availability.save();
      return res.send(availability);
    }

    if (!isHourInDatabase.length) {
      const push = await Availability.findOneAndUpdate(
        { month, day },
        {
          $push: { hours },
        },
        { new: true },
      );
      return res.send(push);
    }

    if (isHourReadyToUpdate.length) {
      const update = await Availability.findOneAndUpdate(
        {
          month, day, 'hours.hour': hours.hour, 'hours.status': 'READY',
        },
        {
          $set: { 'hours.$': hours },
        },
        { new: true },
      );
      return res.send(update);
    }

    res.status(403).send('date already in database');
  } catch (e) {
    res.status(400);
    res.send(e);
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

module.exports = app;
