import BaseGenerator from './BaseGenerator';

const MIN_ARRAY_SIZE = 3;
const MAX_ARRAY_SIZE = 5;

class ArrayGenerator extends BaseGenerator {

  generate(schema) {
    const { min } = this.getTestParameters(schema, 'min');
    const { max } = this.getTestParameters(schema, 'max');
    const length = this.chance.integer({ min: this.getMin(min), max: this.getMax(max) });
    return new Array(length).fill(null);
  }

  getMin(min) {
    return min !== undefined ? min : MIN_ARRAY_SIZE;
  }

  getMax(max) {
    return max !== undefined ? max : MAX_ARRAY_SIZE;
  }
}

export default ArrayGenerator;
