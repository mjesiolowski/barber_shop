const express = require('express');
const Barber = require('../../db/models/barber');

const router = new express.Router();

router.get('/barber/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const barber = await Barber.findById(id);
    if (!barber) {
      return res.status(404).send({ error: 'barber not found' });
    }

    await barber.populate('availability').execPopulate();
    res.send(barber);
  } catch (e) {
    res.status(500).send();
  }
});

router.get('/barbers', async (req, res) => {
  try {
    const barbers = await Barber.find({});
    res.send(barbers);
  } catch (e) {
    res.status(500).send();
  }
});

router.post('/barbers', async (req, res) => {
  const { body } = req;

  const barber = new Barber(body);

  try {
    await barber.save();
    res.status(201).send(barber);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.post('/barbers/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const barber = await Barber.findByCredentials(email, password);
    res.send(barber);
  } catch (e) {
    res.status(400).send();
  }
});

module.exports = router;
