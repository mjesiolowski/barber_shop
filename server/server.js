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

const validateHourValue = (value) => {
  if (!validator.isInt(value, { min: 0, max: 1440 })) {
    return false;
  }

  return true;
};
const validateHourStatus = (value) => {
  if (!['READY', 'OCCUPIED'].some((element) => element === value)) {
    return false;
  }

  return true;
};

app.get('/barber/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const barber = await Barber.findById(id);
    if (!barber) {
      return res.status(404).send('barber not found');
    }

    await barber.populate('availability').execPopulate();
    res.send(barber);
  } catch (e) {
    res.status(500).send();
  }
});

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
    res.status(201).send(barber);
  } catch (e) {
    res.status(400).send(e);
  }
});

app.get('/all_availability', async (req, res) => {
  const { author } = req.body;

  try {
    const findBarberAvailability = await Availability.find(
      { author: mongoose.Types.ObjectId(author) }, 'month day hours',
    );

    const isBarberAvailabilityFound = findBarberAvailability.length;

    if (!isBarberAvailabilityFound) {
      return res.status(404).send({ error: 'Couldn\'t find the barber availability' });
    }

    res.send(findBarberAvailability);
  } catch (e) {
    res.status(404).send(e);
  }
});

app.get('/availability', async (req, res) => {
  const { month, day, author } = req.body;

  try {
    const findBarberAvailability = await Availability.find(
      { month, day, author: mongoose.Types.ObjectId(author) }, 'hours',
    );

    const isDataAvailable = findBarberAvailability.length;

    if (!isDataAvailable) {
      return res.status(404).send({ error: 'Couldn\'t find the date' });
    }

    res.send(findBarberAvailability);
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

app.patch('/availability/:id', async (req, res) => {
  try {
    const { hour: hourFromQuery, status: statusFromQuery } = req.body;

    const availability = await Availability.findById(req.params.id);
    const { day, month } = availability;

    const isHourInDatabase = availability.hours.some(({ hour }) => hour === hourFromQuery);
    const isHourStatusReady = Boolean(availability.hours.filter(({ hour, status }) => hour === hourFromQuery && status === 'READY').length);
    const isHourValidated = validateHourValue(hourFromQuery) && validateHourStatus(statusFromQuery);

    if (!availability) {
      return res.status(404).send();
    }

    if (!isHourValidated) {
      return res.status(403).send('hour value or status is invalid');
    }

    if (!isHourInDatabase) {
      const push = await Availability.findOneAndUpdate(
        { month, day },
        {
          $push: { hours: req.body },
        },
        { new: true },
      );

      return res.status(201).send(push);
    }

    if (isHourStatusReady) {
      const update = await Availability.findOneAndUpdate(
        {
          month, day, 'hours.hour': hourFromQuery, 'hours.status': 'READY',
        },
        {
          $set: { 'hours.$': req.body },
        },
        { new: true },
      );

      return res.status(201).send(update);
    }

    res.status(403).send('hour already in databse');
  } catch (e) {
    res.status(500).send();
  }
});

app.post('/availability', async (req, res) => {
  const { month, day, hours } = req.body;
  const { hour, status } = hours;

  const availability = new Availability(req.body);

  // const populateAvailability = async () => {
  //   await availability.populate('author').execPopulate();
  // };

  const findDateInDatabase = await Availability.find(
    { month, day },
  );

  const isDateInDatabase = findDateInDatabase.length;
  const isHourValidated = validateHourValue(hour) && validateHourStatus(status);

  try {
    if (!isHourValidated) {
      return res.status(403).send('hour value or status is invalid');
    }

    if (isDateInDatabase) {
      return res.status(404).send('date already in database');
    }

    // await populateAvailability();
    await availability.save();
    res.status(201).send(availability);
  } catch (e) {
    res.status(500).send(e);
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

module.exports = app;
