const jwt = require('jsonwebtoken');
const Barber = require('../../db/models/barber');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, 'testsecret');
    const barber = await Barber.findOne({ _id: decoded._id, 'tokens.token': token });

    if (!barber) {
      throw new Error();
    }

    req.barber = barber;
    next();
  } catch (e) {
    res.status(401).send({ error: 'Not authenticated!' });
  }
};

module.exports = auth;
