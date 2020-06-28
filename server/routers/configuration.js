const express = require('express');
const Configuration = require('../../db/models/configuration');
const auth = require('../middleware/auth');

const router = new express.Router();

router.get('/configuration', auth, async (req, res) => {
  try {
    const { isAdmin } = req.user;

    if (!isAdmin) {
      return res.status(403).send();
    }

    const configuration = await Configuration.find({});

    res.send(configuration);
  } catch (e) {
    res.status(500).send();
  }
});

router.post('/configuration', auth, async (req, res) => {
  try {
    const { isAdmin } = req.user;

    if (!isAdmin) {
      return res.status(401).send();
    }

    const getConfigurationFromDB = await Configuration.find({});
    const isConfigurationInDB = Boolean(getConfigurationFromDB.length);

    if (isConfigurationInDB) {
      return res.status(403).send({ error: 'Configuration already in DB' });
    }

    const configuration = new Configuration(req.body);
    await configuration.save();
    res.send(configuration);
  } catch (e) {
    res.status(500).send();
  }
});

router.patch('/configuration', auth, async (req, res) => {
  try {
    const { isAdmin } = req.user;
    const update = req.body;

    if (!isAdmin) {
      return res.status(401).send();
    }

    const updateKeys = Object.keys(req.body);
    const allowedUpdates = ['adminCount', 'barbersCount', 'openingHour', 'closingHour',
    ];
    const isUpdateAllowed = updateKeys.every((key) => allowedUpdates.includes(key));

    if (!isUpdateAllowed) {
      return res.status(400).send({ error: 'Invalid updates!' });
    }

    const configuration = await Configuration.findOneAndUpdate({}, update);

    res.send(configuration);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
