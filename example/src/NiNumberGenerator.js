const { BaseGenerator } = require('../../src/');

class NiNumberGenerator extends BaseGenerator {

  generate({ chance }) {
    const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const start = chance.string({ length: 2, pool });
    const middle = chance.integer({ min: 100000, max: 999999 });
    const end = chance.string({ length: 1, pool });
    return `${start}${middle}${end}`.toUpperCase();
  }
}

module.exports = NiNumberGenerator;
