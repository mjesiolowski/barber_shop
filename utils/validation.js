const validator = require('validator');

const validateHourValue = (value) => {
  if (!validator.isInt(value, { min: 0, max: 1440 })) {
    return false;
  }

  return true;
};
const validateHourStatus = (value) => {
  if (!['READY', 'OCCUPIED'].some((element) => element === value)) {
    return false;
  }

  return true;
};

module.exports = { validateHourStatus, validateHourValue };
