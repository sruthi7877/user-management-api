const { validate: uuidValidate } = require('uuid');

function validateFullName(name) {
  return typeof name === 'string' && name.trim().length > 0;
}

function validateMobile(mob) {
  if (typeof mob !== 'string') return false;

  // Remove prefix +91 or 0 if present
  let num = mob.trim();
  if (num.startsWith('+91')) {
    num = num.slice(3);
  } else if (num.startsWith('0')) {
    num = num.slice(1);
  }
  // Validate 10 digits only
  return /^[6-9]\d{9}$/.test(num);
}

function normalizeMobile(mob) {
  let num = mob.trim();
  if (num.startsWith('+91')) {
    num = num.slice(3);
  } else if (num.startsWith('0')) {
    num = num.slice(1);
  }
  return num;
}

function validatePAN(pan) {
  if (typeof pan !== 'string') return false;
  pan = pan.toUpperCase();
  // PAN format: 5 letters, 4 digits, 1 letter
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan);
}

function validateUUID(id) {
  return typeof id === 'string' && uuidValidate(id);
}

module.exports = {
  validateFullName,
  validateMobile,
  normalizeMobile,
  validatePAN,
  validateUUID,
};
