import BaseGenerator from './BaseGenerator';

const FLOAT_OFFSET = 0.000000001;
const INTEGER_OFFSET = 1;

class NumberGenerator extends BaseGenerator {

  generate(schema) {
    const { min, more } = this.getTestParameters(schema, 'min');
    const { max, less } = this.getTestParameters(schema, 'max');
    return this.hasTest(schema, 'integer')
      ? this.getRandomInteger(min, max, more, less)
      : this.getRandomFloat(min, max, more, less);
  }

  getRandomInteger(min, max, more, less) {
    return this.chance.integer({
      min: this.getMin(min, more, INTEGER_OFFSET),
      max: this.getMax(max, less, INTEGER_OFFSET),
    })
  }

  getRandomFloat(min, max, more, less) {
    return this.chance.floating({
      min: this.getMin(min, more, FLOAT_OFFSET),
      max: this.getMax(max, less, FLOAT_OFFSET),
    })
  }

  getMin(min, more, offset) {
    if (more !== undefined) return more + offset;
    return min
  }

  getMax(max, less, offset) {
    if (less !== undefined) return less - offset;
    return max
  }
}

export default NumberGenerator;
