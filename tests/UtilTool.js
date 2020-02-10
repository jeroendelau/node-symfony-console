const fs = require('fs');
const path = require('path');

module.exports.fixtureContent = (file) => {
  return fs.readFileSync(path.resolve(__dirname, './fixtures/', file)).toString();
};
