const path = require('path');
const express = require('express');
const cors = require('cors');
const availabilityRouter = require('./routers/availability');
const barberRouter = require('./routers/barber');
require('../db/mongoose');

const app = express();
const publicPath = path.join(__dirname, '..', 'public');

app.use(cors());
app.use(express.json());
app.use(barberRouter);
app.use(availabilityRouter);
app.use(express.static(publicPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

module.exports = app;
