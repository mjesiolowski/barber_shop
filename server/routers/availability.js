const express = require('express');
const mongoose = require('mongoose');
const Availability = require('../../db/models/availability');
const validateHour = require('../../utils/validation');
const auth = require('../middleware/auth');

const { validateHourStatus, validateHourValue } = validateHour;

const router = new express.Router();

router.get('/all_availabilities', async (req, res) => {
  try {
    const { author } = req.body;

    const findUserAvailability = await Availability.find(
      { author: mongoose.Types.ObjectId(author) }, 'month day hours.status hours.hour',
    );

    const isUserAvailabilityFound = findUserAvailability.length;

    if (!isUserAvailabilityFound) {
      return res.status(404).send({ error: 'Couldn\'t find the user availability' });
    }

    res.send(findUserAvailability);
  } catch (e) {
    res.status(500).send();
  }
});

router.get('/availability', async (req, res) => {
  try {
    const { month, day, author } = req.body;

    const findUserAvailability = await Availability.find(
      { month, day, author: mongoose.Types.ObjectId(author) }, 'hours.status hours.hour',
    );

    const isDataAvailable = findUserAvailability.length;

    if (!isDataAvailable) {
      return res.status(404).send({ error: 'Couldn\'t find the date' });
    }

    res.send(findUserAvailability);
  } catch (e) {
    res.status(500).send();
  }
});

router.delete('/availability', auth, async (req, res) => {
  try {
    const { body } = req;
    const {
      month, day, hour,
    } = body;

    const date = await Availability.findOneAndUpdate(
      {
        month, day, 'hours.hour': hour, author: req.user._id,
      },
      {
        $set: { 'hours.$': { hour, status: 'DELETED' } },
      },
      { new: true },
    );

    const isDateFound = date !== null;
    if (!isDateFound) {
      return res.status(404).send();
    }

    res.status(201).send({ satus: 'deleted' });
  } catch (e) {
    res.status(500).send();
  }
});

router.patch('/availability/:id', async (req, res) => {
  try {
    const { hour: hourFromQuery, status: statusFromQuery } = req.body;

    const isHourValidated = await validateHourValue(hourFromQuery) && validateHourStatus(statusFromQuery);

    if (!isHourValidated) {
      return res.status(403).send({ error: 'hour value or status is invalid' });
    }

    const availability = await Availability.findById(req.params.id);

    if (!availability) {
      return res.status(404).send({ error: 'availability not found' });
    }

    const { day, month } = availability;

    const isHourInDatabase = availability.hours.some(({ hour }) => hour === hourFromQuery);

    if (!isHourInDatabase) {
      const push = await availability.updateOne(
        {
          $push: { hours: req.body },
        },
        { new: true, runValidators: true },
      );

      return res.status(201).send(push);
    }

    const isHourStatusReady = Boolean(availability.hours.filter(({ hour, status }) => hour === hourFromQuery && status === 'READY').length);

    if (isHourStatusReady) {
      const update = await Availability.findOneAndUpdate(
        {
          month, day, 'hours.hour': hourFromQuery,
        },
        {
          $set: { 'hours.$': req.body },
        },
        { new: true, runValidators: true },
      );
      return res.status(201).send(update);
    }

    res.status(403).send({ error: 'hour already in databse' });
  } catch (e) {
    res.status(500).send();
  }
});

router.post('/availability', auth, async (req, res) => {
  try {
    const { month, day, hours } = req.body;
    const { hour, status } = hours;

    const isHourValidated = await validateHourValue(hour) && validateHourStatus(status);

    if (!isHourValidated) {
      return res.status(403).send({ error: 'hour value or status is invalid' });
    }

    const findDateInDatabase = await Availability.find(
      { month, day },
    );
    const isDateInDatabase = findDateInDatabase.length;

    if (isDateInDatabase) {
      return res.status(403).send({ error: 'date already in database' });
    }

    const availability = new Availability({
      ...req.body,
      author: req.user._id,
    });

    await availability.populate('author').execPopulate();
    await availability.save();
    res.status(201).send({ author: availability.author.name });
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
