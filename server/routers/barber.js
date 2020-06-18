const express = require('express');
const Barber = require('../../db/models/barber');
const auth = require('../middleware/auth');

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

router.get('/barbers/me', auth, async (req, res) => {
  res.send(req.barber);
});

router.get('/barbers', async (req, res) => {
  try {
    const barbers = await Barber.find({}, '_id');
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
    const token = await barber.generateToken();
    res.status(201).send({ barber: barber.getPublicProfile(), token });
  } catch (e) {
    res.status(500).send(e);
  }
});

router.post('/barbers/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const barber = await Barber.findByCredentials(email, password);
    const token = await barber.generateToken();
    res.send({ barber: barber.getPublicProfile(), token });
  } catch (e) {
    res.status(400).send();
  }
});

router.post('/barbers/logout', auth, async (req, res) => {
  try {
    req.barber.tokens = req.barber.tokens.filter((token) => token.token !== req.token);

    await req.barber.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.post('/barbers/logoutAll', auth, async (req, res) => {
  try {
    req.barber.tokens = [];

    await req.barber.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});


module.exports = router;
