const validator = require('validator');
const Configuration = require('../db/models/configuration');

const validateHourValue = async (value) => {
  const configuration = await Configuration.find({});
  const { closingHour, openingHour } = configuration[0];

  const isFullHour = !(closingHour % 25);
  const closingTreshold = isFullHour ? 70 : 30;

  const maxValue = closingHour - closingTreshold;
  if (!validator.isInt(value, { min: openingHour, max: maxValue })) {
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
