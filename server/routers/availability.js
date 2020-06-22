const express = require('express');
const mongoose = require('mongoose');
const Availability = require('../../db/models/availability');
const validateHour = require('../../utils/validation');
const auth = require('../middleware/auth');

const { validateHourStatus, validateHourValue } = validateHour;

const router = new express.Router();

router.get('/all_availabilities', async (req, res) => {
  const { author } = req.body;

  try {
    const findUserAvailability = await Availability.find(
      { author: mongoose.Types.ObjectId(author) }, 'month day hours.status',
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
  const { month, day, author } = req.body;

  try {
    const findUserAvailability = await Availability.find(
      { month, day, author: mongoose.Types.ObjectId(author) }, 'hours.status',
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
  const { body } = req;
  const {
    month, day, hour,
  } = body;

  try {
    const document = await Availability.findOneAndUpdate(
      {
        month, day, author: req.user._id,
      },
      {
        $pull: { hours: { hour } },
      },
      { new: true },
    );

    res.send(document);
  } catch (e) {
    res.status(500).send();
  }
});

router.patch('/availability/:id', async (req, res) => {
  try {
    const { hour: hourFromQuery, status: statusFromQuery } = req.body;

    const availability = await Availability.findById(req.params.id);
    const { day, month } = availability;

    const isHourInDatabase = availability.hours.some(({ hour }) => hour === hourFromQuery);
    const isHourStatusReady = Boolean(availability.hours.filter(({ hour, status }) => hour === hourFromQuery && status === 'READY').length);
    const isHourValidated = validateHourValue(hourFromQuery) && validateHourStatus(statusFromQuery);

    if (!availability) {
      return res.status(404).send({ error: 'availability not found' });
    }

    if (!isHourValidated) {
      return res.status(403).send({ error: 'hour value or status is invalid' });
    }

    if (!isHourInDatabase) {
      const push = await availability.updateOne(
        {
          $push: { hours: req.body },
        },
        { new: true, runValidators: true },
      );

      return res.status(201).send(push);
    }

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
  const { month, day, hours } = req.body;
  const { hour, status } = hours;

  const availability = new Availability({
    ...req.body,
    author: req.user._id,
  });

  const findDateInDatabase = await Availability.find(
    { month, day },
  );

  const isDateInDatabase = findDateInDatabase.length;
  const isHourValidated = validateHourValue(hour) && validateHourStatus(status);

  try {
    if (!isHourValidated) {
      return res.status(403).send({ error: 'hour value or status is invalid' });
    }

    if (isDateInDatabase) {
      return res.status(403).send({ error: 'date already in database' });
    }

    // await availability.populate('author').execPopulate();
    // console.log(availability);
    await availability.save();
    res.status(201).send(availability);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
