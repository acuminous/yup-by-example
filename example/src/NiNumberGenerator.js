const { BaseGenerator } = require('../../lib/');

class NiNumberGenerator extends BaseGenerator {

  generate({ schema, value, originalValue }) {
    const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const start = this.chance.string({ length: 2, pool });
    const middle = this.chance.integer({ min: 100000, max: 999999 });
    const end = this.chance.string({ length: 1, pool });
    return `${start}${middle}${end}`.toUpperCase();
  }
}

module.exports = NiNumberGenerator;
