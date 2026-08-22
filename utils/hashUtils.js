const crypto = require('crypto');

// Generates a SHA-256 hash from any object's contents
const generateHash = (data) => {
  const stringified = JSON.stringify(data);
  return crypto.createHash('sha256').update(stringified).digest('hex');
};

module.exports = { generateHash };