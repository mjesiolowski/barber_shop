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

app.post('/availability', async (req, res) => {
  const { body } = req;
  const { month, day, hour: hourFromQuery } = body;


  const availability = new Availability({
    author: '5edb720e3f15092ab0919332',
    month,
    day,
    hours: [
      hourFromQuery,
    ],
  });

  // console.log({ month, day, hours });
  // console.log('moment: ', moment(date).format('DD-MM-YYYY'));
  // res.send('good');

  const isDateInDatabase = await Availability.find(
    { month, day },
  );

  const isHourInDatabase = await Availability.find(
    { month, day, 'hours.hour': hourFromQuery.hour },
  );

  const isHourReadyToUpdate = await Availability.find(
    {
      month, day, 'hours.hour': hourFromQuery.hour, 'hours.status': 'READY',
    },
  );


  console.log({ isHourInDatabase });
  try {
    if (!isDateInDatabase.length) {
      await availability.save();
      return res.send(availability);
    }

    if (!isHourInDatabase.length) {
      const push = await Availability.findOneAndUpdate(
        { month, day },
        {
          $push: { hours: hourFromQuery },
        },
        { new: true },
      );
      return res.send(push);
    }

    if (isHourReadyToUpdate.length) {
      const update = await Availability.findOneAndUpdate(
        {
          month, day, 'hours.hour': hourFromQuery.hour, 'hours.status': 'READY',
        },
        {
          $set: { 'hours.$': hourFromQuery },
        },
        { new: true },
      );
      return res.send(update);
    }

    // const isHourInDatabase = await Availability.find(
    //   { $and: [{ 'availability.hours.hour': '800' }, { 'availability.day': 8 }] },
    // );

    // const isHourInDatabase = await Availability.find({ availability: { $elemMatch: { day: 8, 'hours.hour': 1000 } } });
    // console.log(isHourInDatabase);
    // if (!isHourInDatabase.length)


    // console.log({ isMonthInDatabse, isDayInDatabase, isHourInDatabase });
    // const update = await Availability.findOneAndUpdate(
    //   { month: 6 },
    //   {
    // $push: {
    //   hours: {
    //     hour: 830,
    //     status: 'UPDATE_TEST',
    //     clientName: 'John Dee',
    //     serviceType: 'combo',
    //   },
    // },
    // },
    // );

    // UPDATE MONTH
    // const update = await Availability.updateOne({ month: 7 }, {
    //   month: 6,
    // });

    // UPDATE GENERAL
    // const update = await Availability.findOneAndUpdate({ day: 6, 'hours.hour': 930 },
    //   {
    //     $set: {
    //       'hours.$.status': 'UPDATE_TEST',
    //     },
    //   },
    //   { new: true });

    // const update = await Availability.update(
    //   { month: 6 },
    //   {
    //     $set: {
    //       'availability.$[e1].hours.$[e2].status': 'KUMITSU',
    //     },
    //   },
    //   {
    //     arrayFilters: [
    //       { 'e1._id': mongoose.Types.ObjectId('5edbae1c7e60cc05a496d444') },
    //       { 'e2._id': mongoose.Types.ObjectId('5edbae1c7e60cc05a496d446') },
    //     ],
    //   },
    // );


    // console.log(update);
    res.status(403).send(isHourInDatabase);
    // const update = await Availability.findOneAndUpdate({ month: 6, 'availability.0.day': 6 },
    //   {
    //     $push: {
    //       'availability.0.hours': {
    //         hour: 900,
    //         status: 'PUSH_TEST',
    //         clientName: 'John Dee',
    //         serviceType: 'combo',
    //       },
    //     },
    //   },
    //   { new: true });

    // console.log(update);
    // res.send('succesfully updated');

    // FIND all hours and then itterate with include or some

    // const test = async () => {
    //   console.log({ hours });
    //   const arrayOfHours = hours.map(({ hour }) => hour);
    //   // const isHourInDatabase = await Availability.find(
    //   //   { 'availability.hours.hour': 830 },
    //   // );
    //   for (const hour of arrayOfHours) {
    //     const isHourInDatabase = await Availability.find(
    //       { 'availability.hours.hour': hour },
    //     );
    //     console.log({ isHourInDatabase });
    //   }

    //   console.log({ arrayOfHours });
    // };

    // test();
  } catch (e) {
    res.status(400);
    res.send(e);
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

module.exports = app;
