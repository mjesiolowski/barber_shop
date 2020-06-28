const express = require('express');
const User = require('../../db/models/user');
const auth = require('../middleware/auth');

const router = new express.Router();

router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
});

router.get('/users/barbers', async (req, res) => {
  try {
    const barbers = await User.find({ isBarber: true }, '_id name');
    res.send(barbers);
  } catch (e) {
    res.status(500).send();
  }
});

router.post('/users/signup', async (req, res) => {
  try {
    const { body } = req;
    const { isAdmin, isBarber } = body;

    if (isAdmin) {
      const findAdmins = await User.find({ isAdmin: true });
      const adminCount = findAdmins.length;

      if (adminCount === 1) {
        return res.status(403).send({ error: 'maximum number of admins is 1' });
      }
    }

    if (isBarber) {
      const findBarbers = await User.find({ isBarber: true });
      const barberCount = findBarbers.length;

      if (barberCount === 5) {
        return res.status(403).send({ error: 'maximum number of admins is 5' });
      }
    }

    const user = new User(body);
    await user.save();
    const token = await user.generateToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(500).send(e);
  }
});

router.post('/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByCredentials(email, password);
    const token = await user.generateToken();

    res.send({ user, token });
  } catch (e) {
    res.status(400).send();
  }
});

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);

    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];

    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.patch('/users/me', auth, async (req, res) => {
  try {
    const updateKeys = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password'];
    const isUpdateAllowed = updateKeys.every((key) => allowedUpdates.includes(key));

    if (!isUpdateAllowed) {
      return res.status(400).send({ error: 'Invalid updates!' });
    }

    updateKeys.forEach((key) => req.user[key] = req.body[key]);

    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete('/users/me', auth, async (req, res) => {
  try {
    if (req.user.isAdmin) {
      return res.status(403).send({ error: 'admin cannot be removed' });
    }

    await req.user.remove();

    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
