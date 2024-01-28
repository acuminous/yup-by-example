const debug = require('debug')('yup-by-example:generators:StringGenerator');
const BaseGenerator = require('./BaseGenerator');

const MIN = 10;
const SPREAD = 10;

class StringGenerator extends BaseGenerator {

  generate({ chance, schema }) {
    const value = this.hasWhitelist(schema)
      ? this.generateFromWhitelist(chance, schema)
      : this.generateFromRange(chance, schema);
    debug('Generating string{%s}', value);
    return value;
  }

  generateFromWhitelist(chance, schema) {
    return this.oneOf(chance, schema.whitelist);
  }

  generateFromRange(chance, schema) {
    const { min } = this.getTestParameters(schema, 'min');
    const { max } = this.getTestParameters(schema, 'max');
    const { length = this.getLength(chance, min, max) } = this.getTestParameters(schema, 'length');
    if (this.hasTest(schema, 'email')) return chance.email();
    if (this.hasTest(schema, 'url')) return chance.url();
    return chance.string({ length, alpha: true });
  }

  getLength(chance, min, max) {
    if (typeof min === 'number' && typeof max === 'number') return chance.integer({ min, max });
    if (typeof min === 'number') return chance.integer({ min, max: min + SPREAD });
    if (typeof max === 'number') return chance.integer({ min: Math.max(1, max - SPREAD), max });
    return chance.integer({ min: MIN, max: MIN + SPREAD });
  }
}

module.exports = StringGenerator;
