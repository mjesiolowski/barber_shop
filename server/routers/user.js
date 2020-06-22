const express = require('express');
const User = require('../../db/models/user');
const auth = require('../middleware/auth');

const router = new express.Router();

// router.get('/user/:id', async (req, res) => {
//   try {
//     const { id } = req.params;

//     const user = await User.findById(id);
//     if (!user) {
//       return res.status(404).send({ error: 'user not found' });
//     }

//     await user.populate('availability').execPopulate();
//     res.send(user);
//   } catch (e) {
//     res.status(500).send();
//   }
// });

router.get('/users/me', auth, async (req, res) => {
  res.send(req.user.getPublicProfile());
});

router.get('/users/barbers', async (req, res) => {
  try {
    const users = await User.find({ isBarber: true }, '_id name');
    res.send(users);
  } catch (e) {
    res.status(500).send();
  }
});

router.post('/users', async (req, res) => {
  const { body } = req;

  const user = new User(body);

  try {
    await user.save();
    const token = await user.generateToken();
    res.status(201).send({ user: user.getPublicProfile(), token });
  } catch (e) {
    res.status(500).send(e);
  }
});

router.post('/users/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findByCredentials(email, password);
    const token = await user.generateToken();
    res.send({ user: user.getPublicProfile(), token });
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
  const updateKeys = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password'];
  const isUpdateAllowed = updateKeys.every((key) => allowedUpdates.includes(key));

  if (!isUpdateAllowed) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    updateKeys.forEach((key) => req.user[key] = req.body[key]);

    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete('/users/me', auth, async (req, res) => {
  try {
    await req.user.remove();

    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});


module.exports = router;
