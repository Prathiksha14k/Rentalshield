const crypto = require('crypto');

// Generates a SHA-256 hash from any object's contents
const generateHash = (data) => {
  const stringified = JSON.stringify(data);
  return crypto.createHash('sha256').update(stringified).digest('hex');
};

// Generates a SHA-256 hash directly from a file's raw byte buffer
const generateFileHash = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

module.exports = { generateHash, generateFileHash };