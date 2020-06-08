const path = require('path');
const express = require('express');
const cors = require('cors');
require('../db/mongoose');
const mongoose = require('mongoose');
const validator = require('validator');
const Barber = require('../db/models/barber');
const Availability = require('../db/models/availability');

const app = express();
const publicPath = path.join(__dirname, '..', 'public');

app.use(cors());
app.use(express.json());
app.use(express.static(publicPath));

app.get('/barbers', async (req, res) => {
  try {
    const barbers = await Barber.find({});
    res.send(barbers);
  } catch (e) {
    res.status(500).send();
  }
});


app.post('/barbers', async (req, res) => {
  const { body } = req;

  const barber = new Barber(body);

  try {
    await barber.save();
    res.send(barber);
  } catch (e) {
    res.status(400).send('couldn\'t create');
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
  const { month, day, hours } = req.body;

  const availability = new Availability(req.body);

  const populateAvailability = async () => {
    await availability.populate('author').execPopulate();
    // console.log(availability);
    const barber = await Barber.findById('5edb720e3f15092ab0919332');
    await barber.populate('availability').execPopulate();
    // console.log('found: ', barber.availability);
  };

  const findDateInDatabase = await Availability.find(
    { month, day },
  );

  const findHourInDatabase = await Availability.find(
    { month, day, 'hours.hour': hours.hour },
  );

  const checkIfHourStatusIsReady = await Availability.find(
    {
      month, day, 'hours.hour': hours.hour, 'hours.status': 'READY',
    },
  );

  const isDateInDatabase = findDateInDatabase.length;
  const isHourInDatabase = findHourInDatabase.length;
  const isHourStatusReady = checkIfHourStatusIsReady.length;

  const validateHourValue = (value) => {
    if (!validator.isInt(value, { min: 0, max: 1440 })) {
      return false;
    }

    return true;
  };

  const validateHourSatus = (value) => {
    if (!['READY', 'OCCUPIED'].some((element) => element === value)) {
      return false;
    }

    return true;
  };

  const isHourValidated = validateHourValue(hours.hour) && validateHourSatus(hours.status);

  console.log({ isHourValidated });

  try {
    if (!isHourValidated) {
      return res.status(403).send('hour value or status is invalid');
    }

    if (!isDateInDatabase) {
      await availability.save();
      await populateAvailability();
      return res.send(availability);
    }

    if (!isHourInDatabase) {
      const push = await Availability.findOneAndUpdate(
        { month, day },
        {
          $push: { hours },
        },
        { new: true },
      );
      await populateAvailability();
      return res.send(push);
    }

    if (isHourStatusReady) {
      const update = await Availability.findOneAndUpdate(
        {
          month, day, 'hours.hour': hours.hour, 'hours.status': 'READY',
        },
        {
          $set: { 'hours.$': hours },
        },
        { new: true },
      );
      await populateAvailability();
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
