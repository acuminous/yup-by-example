const debug = require('debug')('yup-by-example:generators:NumberGenerator');
const BaseGenerator = require('./BaseGenerator');

const FLOAT_OFFSET = 0.000000001;
const INTEGER_OFFSET = 1;

class NumberGenerator extends BaseGenerator {

  generate({ chance, schema }) {
    const value = this.hasWhitelist(schema)
      ? this.generateFromWhitelist(chance, schema)
      : this.generateFromRange(chance, schema);
    debug('Generated number{%d}', value);
    return value;
  }

  generateFromWhitelist(chance, schema) {
    return this.oneOf(chance, schema.oneOf);
  }

  generateFromRange(chance, schema) {
    const { min, more } = this.getTestParameters(schema, 'min');
    const { max, less } = this.getTestParameters(schema, 'max');
    return this.hasTest(schema, 'integer')
      ? this.getRandomInteger(chance, min, max, more, less)
      : this.getRandomFloat(chance, min, max, more, less);
  }

  getRandomInteger(chance, min, max, more, less) {
    return chance.integer({
      min: this.getMin(min, more, INTEGER_OFFSET),
      max: this.getMax(max, less, INTEGER_OFFSET),
    });
  }

  getRandomFloat(chance, min, max, more, less) {
    return chance.floating({
      min: this.getMin(min, more, FLOAT_OFFSET),
      max: this.getMax(max, less, FLOAT_OFFSET),
    });
  }

  getMin(min, more, offset) {
    if (more !== undefined) return more + offset;
    return min;
  }

  getMax(max, less, offset) {
    if (less !== undefined) return less - offset;
    return max;
  }
}

module.exports = NumberGenerator;
